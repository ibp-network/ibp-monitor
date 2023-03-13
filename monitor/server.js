
import fs from 'fs'
import moment from 'moment'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
// import { webSockets } from '@libp2p/websockets'
// import { all as filters_all } from '@libp2p/websockets/filters'
// import { webRTCDirect } from '@libp2p/webrtc-direct'
// import wrtc from 'wrtc'
// import { webRTCStar } from '@libp2p/webrtc-star'
// import { Noise } from '@libp2p/noise' // @deprecated
import { noise } from "@chainsafe/libp2p-noise"
import { mplex } from '@libp2p/mplex'
import { kadDHT } from '@libp2p/kad-dht'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { createEd25519PeerId, createFromJSON, createFromPrivKey } from '@libp2p/peer-id-factory'

import { DataStore } from './lib/DataStore.js'
import { Op, Sequelize } from 'sequelize'
// import { DataStoreLoki } from './lib/DataStoreLoki.js'
import { MessageHandler } from './lib/MessageHandler.js'
import { HealthChecker } from './lib/HealthChecker.js'
// import { HttpHandler } from './lib/HttpHandler.js'
import { asyncForeach, streamToString, stringToStream } from './lib/utils.js'

// const star = webRTCStar()
// const direct = webRTCDirect()

import { Job, QueueEvents, Queue } from 'bullmq';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
console.log('VERSION', pkg.version)

import { config } from './config/config.js'
import { configLocal } from './config/config.local.js'
const cfg = Object.assign(config, configLocal)

const queueOpts = {
  connection: cfg.redis
}
const jobRetention = {
  timeout: 60 * 1000, // active jobs timeout after 60 seconds
  removeOnComplete: {
    age: 5 * 24 * 60 * 60, // keep up to 5 * 24 hour (in millis)
    count: 10000, // keep up to 1000 jobs
  },
  removeOnFail: {
    age: 5 * 24 * 60 * 60, // keep up to 5 * 24 hours (in millis)
  }
}

// not used, we listen on the port(s) in cfg.addresses
// const GOSSIP_PORT = cfg.listenPort || 30000

const UPDATE_INTERVAL = cfg.updateInterval || 5 * 60 * 1000 // 5 mins, in millis

const ds = new DataStore({ initialiseDb: false, pruning: cfg.pruning })
const hc = new HealthChecker({ datastore: ds })
const mh = new MessageHandler({ datastore: ds, api: hc })
// const hh = new HttpHandler({ datastore: ds, version: pkg.version })

;(async () => {

  // get PeerId
  var peerId
  if (fs.existsSync('./keys/peerId.json')) {
    const pidJson = JSON.parse(fs.readFileSync('./keys/peerId.json', 'utf-8'))
    // console.debug(pidJson)
    peerId = await createFromJSON(pidJson)
  } else {
    peerId = await createEd25519PeerId()
    fs.writeFileSync('./keys/peerId.json', JSON.stringify({
      id: peerId.toString(),
      privKey: uint8ArrayToString(peerId.privateKey, 'base64'), // .toString(),
      pubKey: uint8ArrayToString(peerId.publicKey, 'base64'),   // .toString()
    }), 'utf-8')
  }
  console.debug('Our monitorId', peerId.toString())
  // hh.setLocalMonitorId(peerId.toString())
  hc.setLocalMonitorId(peerId.toString())

  // ensure our monitorId is in the DB, add the multiaddrs when connected below
  const [monitor, monCreated] = await ds.Monitor.upsert({
    monitorId: peerId.toString(),
    name: 'localhost',
    // multiaddrs will be updated after start()
    // multiaddrs: cfg.addresses
  })
  const serviceIds = cfg.services.map(s => s.serviceUrl)
  cfg.services.forEach(async (service) => {
    await ds.Service.upsert(service)
  })
  await monitor.addServices(serviceIds)
  // ds.upsert('Monitor',
  //   { monitorId: peerId.toString() },
  //   { name: 'localhost', services: cfg.services.map(s => s.serviceUrl) }
  // ) // .data()
  // cfg.services.forEach(service => {
  //   ds.upsert('Service', { serviceUrl: service.serviceUrl }, service)
  // })

  const gsub = gossipsub({
    emitSelf: false, // don't want our own pubsub messages
    gossipIncoming: true,
    fallbackToFloodsub: true,
    floodPublish: true,
    doPX: true,
    allowPublishToZeroPeers: true,
    signMessages: true, // TODO: how can we test this?
    strictSigning: true,
    // messageCache: false,
    // scoreParams: {},
    // directPeers: [],
    // allowedTopics: [ '/fruit' ]
    allowedTopics: cfg.allowedTopics
  });

  const libp2p = await createLibp2p({
    peerId,
    addresses: cfg.addresses,
    transports: [
      new tcp(),
      // webRTCDirect({ wrtc }),
      // webSockets({
      //   // connect to all sockets, even insecure ones
      //   filters: filters_all
      // }),
      // star.transport
    ],
    streamMuxers: [
      mplex()
    ],
    connectionEncryption: [ new noise() ],
    connectionManager: {
      autoDial: true,
    },
    peerDiscovery: [
      mdns({
        interval: 20e3
      }),
      bootstrap({
        enabled: true,
        list: cfg.bootstrapPeers,
        timeout: 3 * 1000, // in ms,
        tagName: 'bootstrap',
        tagValue: 50,
        tagTTL: 120 * 1000 // in ms
      }),
      pubsubPeerDiscovery({
        interval: 10 * 1000, // in ms?
        // topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
        topics: [
          `ibp_monitor._peer-discovery._p2p._pubsub`,
          '_peer-discovery._p2p._pubsub'
        ],
        listenOnly: false
      }),
      // star.discovery
    ],
    relay: cfg.relay,
    dht: kadDHT(),
    pubsub: gsub
  })

  await libp2p.start()
  console.debug(libp2p.getMultiaddrs())

  // update our monitor record with computed multiAddrs
  await ds.Monitor.update(
    { multiaddrs: libp2p.getMultiaddrs() },
    { where: { monitorId: peerId.toString() } }
  )

  libp2p.dht.addEventListener('peer', (peer) => {
    console.log('WOOT: dht peer', peer.toString())
  })
  libp2p.connectionManager.addEventListener('peer:connect', (peerId) => {
    console.debug('peer:connect', peerId.detail?.remotePeer.toString(), 'at', peerId.detail?.remoteAddr.toString())
  })
  libp2p.connectionManager.addEventListener('peer:disconnect', (peerId) => {
    console.debug('peer:disconnect', peerId.detail?.remotePeer.toString(), 'at', peerId.detail?.remoteAddr.toString())
  })

  libp2p.addEventListener('peer:discovery', async (peerId) => {
    console.debug('peer:discovery, we have', libp2p.getPeers().length, 'peers')
    console.debug('libp2p.connectionManager.listenerCount', libp2p.connectionManager.listenerCount())
    await mh.handleDiscovery(peerId)
  })
  libp2p.pubsub.addEventListener('message', async (evt) => {
    await mh.handleMessage(evt)
  })
  // subscribe to pubsub topics
  for (var i=0; i < cfg.allowedTopics.length; i++) {
    console.debug('subscribing to', cfg.allowedTopics[i])
    libp2p.pubsub.subscribe(cfg.allowedTopics[i])
  }

  libp2p.handle(['/ibp/ping'], (event) => {
    const {stream, connection } = event;
    // console.debug(stream, connection, protocol)
    return mh.handleProtocol({ stream, connection, protocol: '/ibp/ping' })
  })

  // publish our services 
  console.debug('Publishing our services')
  await mh.publishServices(cfg.services, libp2p)
  setInterval(async () => {
    console.debug('Publishing our services')
    await mh.publishServices(cfg.services, libp2p)
  }, UPDATE_INTERVAL)

  // console.log('defining publishResults, we have', libp2p.getPeers().length, 'peers')
  // publish the results of our healthChecks

  const q_health_check = new Queue('health_check', queueOpts);
  const queueEvents = new QueueEvents('health_check', queueOpts);
  queueEvents.on('completed', async ({ jobId }) => {
    const job = await Job.fromId(q_health_check, jobId);
    // console.log(job.data, job.returnvalue);
    const { service } = job.data
    const result = job.returnvalue
    // mark service as online
    if (result.level !== 'error') {
      await ds.Service.update({ status: 'online' }, { where: { serviceUrl: service.serviceUrl } })
    } else {
      await ds.Service.update({ errorCount: Sequelize.literal('errorCount + 1') }, { where: { serviceUrl: service.serviceUrl } })
    }
    // log the peerId for the serviceUrl
    if (result.peerId) await ds.Peer.upsert({ peerId: result.peerId, serviceUrl: service.serviceUrl})
    ds.HealthCheck.create(result)
    if (cfg.gossipResults) {
      console.debug(`[gossip] publishing healthCheck: ${service.serviceUrl} ${result.level} to /ibp/healthCheck`)
      const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
    }
  });
  queueEvents.on('error', (args) => {
    console.log('Queue error', args)
  })
  queueEvents.on('failed', (event, listener, id) => {
    console.log('Queue failed', event, listener, id)
  })

  async function publishResults () {
    console.debug('Performing our healthChecks for', libp2p.getPeers().length, 'peers')
    // relying on peers to be connected is not reliable...
    // iterate the monitors != our peerId

    if (cfg.checkOtherServices) {
      const monitors = await ds.Monitor.findAll({ where: { monitorId: { [Op.ne]: peerId.toString() } }, include: 'services' })
      for (let i = 0; i < monitors.length; i++) {
        const monitor = monitors[i]
        // console.log('- our peers are:', peerId.toString())
        // const monitor = await ds.Monitor.findByPk(peerId.toString(), { include: 'services' })
        // const monitor = ds.Monitor.findOne({ monitorId: peerId.toString() }).data()
        // console.debug('peer', peer)
        if (monitor) {
          console.debug('Checking services for monitor', monitor.monitorId)
          // const results = await hc.check(monitor.services || [])
          for (let i = 0; i < monitor.services.length; i++) {
            const service = monitor.services[i]
            console.debug('--> service', service.serviceUrl)
            // check if stalled
            const activeJobs = await q_health_check.getActive() 
            const activeJob = activeJobs.find(j => j.data.service.serviceUrl === service.serviceUrl)
            if (activeJob) {
              const deadline = moment(activeJob.timestamp).add(60, 'seconds')
              if (moment() > deadline) {
                console.log(activeJob.id, 'Job seems stale, discarding!')
                activeJob.log('Job seems stale, discarding!')
                // activeJob.discard()
                try {
                  const moved = await activeJob.moveToFailed({message: 'Stale job after 60s'}, null)
                  console.log('moved', moved)
                } catch (err) {
                  console.log('could not move stale job...')
                }
              }
            }
            // check if there is a job in the queue?
            const waiting = await q_health_check.getWaiting()
            const job = waiting.find(w => w.data.service.serviceUrl === service.serviceUrl)
            if(job) {
              console.log('   ', 'already in the queue, id:', job.id)
            } else {
              q_health_check.add('health_check', { service, monitorId: peerId.toString() }, { repeat: false, ...jobRetention })
            }
          }
          // console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
          // asyncForeach(results, async (result) => {
          //   const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
          //   // console.debug('sent message to peer', res?.toString())
          // })  
        } else {
          console.warn('could not find monitor', peerId.toString())
        }
      } // === end of peers update cycle ===
    }

    // check our own services?
    if (cfg.checkOwnServices) {
      console.debug('checking our own services...')
      const monitor = await ds.Monitor.findOne({ where: { monitorId: peerId.toString() }, include: 'services' })
      monitor.services.forEach(async (service) => {
        console.debug('--> service', service.serviceUrl)
        // check if there is a job in the queue?
        const waiting = await q_health_check.getWaiting()
        const job = waiting.find(w => w.data.service.serviceUrl === service.serviceUrl)
        if(job) {
          console.log('   ', 'already in the queue, id:', job.id)
        } else {
          q_health_check.add('health_check', { service, monitorId: peerId.toString() }, { repeat: false, ...jobRetention })
        }
      })
    }
  } // end of publishResults()

  console.log(`UPDATE_INTERVAL: ${UPDATE_INTERVAL/1000} seconds`)

  // TODO: move this to worker
  // pubsub should balance the # peer connections. Each node will only healthCheck its peers.
  // results will be broadcast to all peers
  await publishResults()
  setInterval(async function() {
    await publishResults()
  }, UPDATE_INTERVAL)

  // TODO move pruning to worker
  // pruning
  setInterval(async () => {
    await ds.prune()
  }, cfg.pruning.interval * 1000)

})()
