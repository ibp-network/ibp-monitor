
import fs from 'fs'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
// import { webSockets } from '@libp2p/websockets'
// import { all as filters_all } from '@libp2p/websockets/filters'
import { webRTCDirect } from '@libp2p/webrtc-direct'
import wrtc from 'wrtc'
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
import { Op } from 'sequelize'
// import { DataStoreLoki } from './lib/DataStoreLoki.js'
import { MessageHandler } from './lib/MessageHandler.js'
import { HealthChecker } from './lib/HealthChecker.js'
import { HttpHandler } from './lib/HttpHandler.js'
import { asyncForeach, streamToString, stringToStream } from './lib/utils.js'

// const star = webRTCStar()
// const direct = webRTCDirect()

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
console.log('VERSION', pkg.version)

import { config } from './config.js'
import { configLocal } from './config.local.js'
const cfg = Object.assign(config, configLocal)

const HTTP_PORT = cfg.httpPort || 30001
const GOSSIP_PORT = cfg.listenPort || 30000
const UPDATE_INTERVAL = cfg.updateInterval || 3000

// TODO make this dns and ip4...?
// const EXTERNAL_IP = cfg.externalIp || '0.0.0.0'
// const LISTEN_ADDRESS = `/ip4/${EXTERNAL_IP}/tcp/${GOSSIP_PORT}`

const ds = new DataStore({ initialiseDb: false, pruning: cfg.pruning })
// const ds = new DataStoreLoki({ initialiseDb: false, pruning: cfg.pruning })
const hc = new HealthChecker({ datastore: ds })
const mh = new MessageHandler({ datastore: ds, api: hc })
const hh = new HttpHandler({ datastore: ds, version: pkg.version })

var counter = 0;

// peerId: [list of services]
// var serviceCatalog = {};

(async () => {

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
  hh.setLocalMonitorId(peerId.toString())
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
      webRTCDirect({ wrtc }),
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
  await mh.publishServices(cfg.services, libp2p)
  setInterval(async () => {
    console.debug('Publishing our services')
    await mh.publishServices(cfg.services, libp2p)
  }, UPDATE_INTERVAL)

  // console.log('defining publishResults, we have', libp2p.getPeers().length, 'peers')
  // publish the results of our healthChecks
  async function publishResults () {
    console.debug('Publishing our healthChecks for', libp2p.getPeers().length, 'peers')
    // relying on peers to be connected is not reliable...
    // iterate the monitors != our peerId
    // libp2p.getPeers().forEach(async (peerId) => {
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
        var results = []
        for (let i = 0; i < monitor.services.length; i++) {
          const service = monitor.services[i]
          console.debug('=== service', service.serviceUrl)
          var res = {}
          try {
            res = await hc.check([service])
          } catch (err) {
            console.debug('\n\nERROR FROM Healthcheck!!!\n\n')
            console.error(err)
            res = { monitorId: this.localMonitorId, serviceUrl: service.serviceUrl, source: check, record: { performance: -1 , error: err } }
          }
          results.push(...res)
        }
        console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
        asyncForeach(results, async (result) => {
          const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
          // console.debug('sent message to peer', res?.toString())
        })  
      } else {
        console.warn('could not find monitor', peerId.toString())
      }
    } // === end of peers update cycle ===

    // check our own services?
    if (cfg.checkOwnServices) {
      console.debug('checking our own services...')
      const monitor = ds.Monitor.findAll({ where: { monitorId: peerId.toString() }, include: 'services' })
      // const monitor = ds.Monitor.findOne({ monitorId: peerId.toString() })
      const results = await hc.check(monitor?.services || [])
      console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
      })
    }
  } // end of publishResults()

  // pubsub should balance the # peer connections. Each node will only healthCheck its peers.
  // results will be broadcast to all peers
  // await publishResults()
  setInterval(async function() {
    await publishResults()
  }, UPDATE_INTERVAL)

  // pruning
  setInterval(async () => {
    await ds.prune()
  }, cfg.pruning.interval * 1000)

  // start HttpHandler
  hh.listen(HTTP_PORT, () => {
    // app.listen(HTTP_PORT, () => {    
    console.log('\nServer is running, press crtl-c to stop\n')
    process.on('SIGINT', async () => {
      console.warn('\nControl-c detected, shutting down...')
      await libp2p.stop()
      // close the DB gracefully
      await ds.close()
      console.warn('... stopped!')
      process.exit()
    });  // CTRL+C
  })

})()
