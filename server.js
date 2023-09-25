'use strict'
import './dotenv.js'

import fs from 'fs'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { kadDHT } from '@libp2p/kad-dht'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { createEd25519PeerId, createFromJSON } from '@libp2p/peer-id-factory'

import { DataStore } from './data/data-store.js'
import { MessageHandler } from './lib/message-handler.js'
import { HealthChecker } from './lib/health-checker.js'

import { Job, QueueEvents, Queue } from 'bullmq'
import { isIPv4, isIPv6 } from 'is-ip'
import isValidHostname from 'is-valid-hostname'
import { Logger } from './lib/utils.js'

import * as dotenv from 'dotenv'
dotenv.config()

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
console.log('VERSION', pkg.version)

import { config } from './config/config.js'
import { config as configLocal } from './config/config.local.js'
import { ProvidersAggregateRoot } from './domain/providers.aggregate.js'
import { Op } from 'sequelize'
import chalkTemplate from 'chalk-template'

const cfg = Object.assign(config, configLocal)
const logger = new Logger('server')

const queueOpts = {
  connection: cfg.redis,
}
const jobRetention = {
  timeout: 60 * 1000, // active jobs timeout after 60 seconds
  removeOnComplete: {
    age: 5 * 24 * 60 * 60, // keep up to 5 * 24 hour (in millis)
    count: 10000, // keep up to 1000 jobs
  },
  removeOnFail: {
    age: 5 * 24 * 60 * 60, // keep up to 5 * 24 hours (in millis)
  },
}

// not used, we listen on the port(s) in cfg.addresses
// const GOSSIP_PORT = cfg.listenPort || 30000

const UPDATE_INTERVAL = cfg.updateInterval || 10 * 60 * 1000 // 10 mins, in millis

const ds = new DataStore({ pruning: cfg.pruning })
const mh = new MessageHandler({ datastore: ds })
// const hh = new HttpHandler({ datastore: ds, version: pkg.version })

;(async () => {
  // get PeerId
  var peerId
  if (fs.existsSync('./keys/peer-id.json')) {
    const pidJson = JSON.parse(fs.readFileSync('./keys/peer-id.json', 'utf-8'))
    // logger.debug(pidJson)
    peerId = await createFromJSON(pidJson)
  } else {
    peerId = await createEd25519PeerId()
    fs.writeFileSync(
      './keys/peer-id.json',
      JSON.stringify({
        id: peerId.toString(),
        privKey: uint8ArrayToString(peerId.privateKey, 'base64'), // .toString(),
        pubKey: uint8ArrayToString(peerId.publicKey, 'base64'), // .toString()
      }),
      'utf-8'
    )
  }
  logger.debug('Our monitorId', peerId.toString())

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
    allowedTopics: cfg.allowedTopics,
  })

  const announce = []
  // check if P2P public IP environment variable is set and not empty
  if (process.env.P2P_PUBLIC_IP && process.env.P2P_PUBLIC_IP.length > 0) {
    if (isIPv4(process.env.P2P_PUBLIC_IP)) {
      const multiaddress = `/ip4/${process.env.P2P_PUBLIC_IP}/tcp/${
        cfg.listenPort
      }/p2p/${peerId.toString()}`
      logger.log(`Announcing P2P IPv4 multiaddress: ${multiaddress}`)
      announce.push(multiaddress)
    } else if (isIPv6(process.env.P2P_PUBLIC_IP)) {
      const multiaddress = `/ip6/${process.env.P2P_PUBLIC_IP}/tcp/${
        cfg.listenPort
      }/p2p/${peerId.toString()}`
      logger.log(`Announcing P2P IPv6 multiaddress: ${multiaddress}`)
      announce.push(multiaddress)
    } else {
      logger.error(
        `Invalid P2P_PUBLIC_IP environment variable: ${process.env.P2P_PUBLIC_IP}. P2P IP address will NOT be announced.`
      )
    }
  }
  // check if P2P public host environment variable is set and not empty
  if (process.env.P2P_PUBLIC_HOST && process.env.P2P_PUBLIC_HOST.length > 0) {
    if (isValidHostname(process.env.P2P_PUBLIC_HOST)) {
      const multiaddress = `/dnsaddr/${process.env.P2P_PUBLIC_HOST}/tcp/${
        cfg.listenPort
      }/p2p/${peerId.toString()}`
      logger.log(`Announcing P2P DNS multiaddress: ${multiaddress}`)
      announce.push(multiaddress)
    } else {
      logger.error(
        `Invalid P2P_PUBLIC_HOST environment variable: ${process.env.P2P_PUBLIC_HOST}. P2P DNS address will NOT be announced.`
      )
    }
  }

  const libp2p = await createLibp2p({
    peerId,
    addresses: {
      listen: [`/ip4/0.0.0.0/tcp/${cfg.listenPort}`],
      announce,
    },
    transports: [new tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [new noise()],
    connectionManager: {
      autoDial: true,
      minConnections: 3, // does this force a reconnect?
      maxConnections: 10,
    },
    peerDiscovery: [
      mdns({
        interval: 20e3,
      }),
      bootstrap({
        enabled: true,
        list: cfg.bootstrapPeers,
        timeout: 3 * 1000, // in ms,
        tagName: 'bootstrap',
        tagValue: 50,
        tagTTL: 120 * 1000, // in ms
      }),
      pubsubPeerDiscovery({
        interval: 10 * 1000, // in ms?
        // topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
        topics: [`ibp_monitor._peer-discovery._p2p._pubsub`, '_peer-discovery._p2p._pubsub'],
        listenOnly: false,
      }),
      // star.discovery
    ],
    relay: cfg.relay,
    dht: kadDHT(),
    pubsub: gsub,
  })

  await libp2p.start()
  logger.debug(libp2p.getMultiaddrs())

  // update our monitor record with computed multiAddrs
  await ds.Monitor.upsert({
    id: peerId.toString(),
    name: 'local',
    multiaddress: libp2p.getMultiaddrs(),
  })

  libp2p.dht.addEventListener('peer', (peer) => {
    logger.log('WOOT: dht peer', peer.toString())
  })

  libp2p.connectionManager.addEventListener('peer:connect', (peerId) => {
    logger.debug(
      'peer:connect',
      peerId.detail?.remotePeer.toString(),
      'at',
      peerId.detail?.remoteAddr.toString()
    )
  })
  libp2p.connectionManager.addEventListener('peer:disconnect', (peerId) => {
    logger.debug(
      'peer:disconnect',
      peerId.detail?.remotePeer.toString(),
      'at',
      peerId.detail?.remoteAddr.toString()
    )
  })

  libp2p.addEventListener('peer:discovery', async (peerId) => {
    logger.debug('peer:discovery, we have', libp2p.getPeers().length, 'peers')
    logger.debug('libp2p.connectionManager.listenerCount', libp2p.connectionManager.listenerCount())
    await mh.handleDiscovery(peerId)
  })

  libp2p.pubsub.addEventListener('message', async (evt) => {
    await mh.handleMessage(evt)
  })

  // subscribe to pubsub topics
  for (var i = 0; i < cfg.allowedTopics.length; i++) {
    logger.debug('subscribing to', cfg.allowedTopics[i])
    libp2p.pubsub.subscribe(cfg.allowedTopics[i])
  }

  libp2p.handle(['/ibp/ping'], (event) => {
    const { stream, connection } = event
    // logger.debug(stream, connection, protocol)
    return mh.handleProtocol({ stream, connection, protocol: '/ibp/ping' })
  })

  // publish the results of our checkService via libp2p
  const checkServiceQueue = new Queue('checkService', queueOpts)
  const checkExternalServiceQueue = new Queue('checkExternalService', queueOpts)
  const checkServiceEvents = new QueueEvents('checkService', queueOpts)
  const checkExternalServiceEvents = new QueueEvents('checkExternalService', queueOpts)

  const handleCheckServiceResult = async (queue, { jobId }) => {
    const job = await Job.fromId(queue, jobId)
    logger.log(
      chalkTemplate`{magenta.bold handleCheckServiceResult(${queue.name}, ${jobId}):}
      {bold Monitor ID:} ${job.returnvalue.monitorId}
      {bold Service ID:} ${job.returnvalue.serviceId}
      {bold Member ID:} ${job.returnvalue.memberId}
      {bold Status:} ${job.returnvalue.status}
      {bold Response time:} ${job.returnvalue.responseTimeMs?.toFixed(2) ?? NaN}ms
    `
    )
    if (!job.returnvalue) {
      return
    }
    const { member, service } = job.data
    const result = job.returnvalue
    // we could get hc for monitor that has not connected yet
    if (result.monitorId) {
      let monitor = await ds.Monitor.upsert(
        { id: result.monitorId, multiaddress: [], status: 'active' },
        { fields: ['status'] }
      )
    }
    // upsert member service node
    if (result.peerId) {
      let memberService = await ds.MemberService.findOne({ where: { serviceId: service.id } })
      // FIXME: we need to add a memberService from the memnbers.json file
      if (!memberService) {
        logger.error('No memberService for', member.id, service.id)
        return
      }
      await ds.MemberServiceNode.upsert(
        {
          peerId: result.peerId,
          serviceId: service.id,
          memberId: member.id,
          name: null,
          status: 'active',
        },
        { fields: ['status'] }
      )
    }
    // insert health check
    await ds.HealthCheck.create(result)
    if (cfg.gossipResults) {
      logger.debug(
        `[gossip] publishing healthCheck: ${member.id} ${service.id} to /ibp/healthCheck`
      )
      const res = await libp2p.pubsub.publish(
        '/ibp/healthCheck',
        uint8ArrayFromString(JSON.stringify(result))
      )
      // debug recipient list
      logger.debug(res)
    }
  }

  const onCheckError = (args) => {
    logger.error('Check service queue error', args)
  }
  const onCheckQueueFailed = (event, listener, id) => {
    logger.log('Queue failed', event, listener, id)
  }

  checkServiceQueue.on('completed', (job) => handleCheckServiceResult(checkServiceQueue, job))
  checkServiceQueue.on('error', onCheckError)
  checkServiceQueue.on('failed', onCheckQueueFailed)
  checkServiceEvents.on('completed', (job) => handleCheckServiceResult(checkServiceQueue, job))

  checkExternalServiceQueue.on('completed', (job) =>
    handleCheckServiceResult(checkExternalServiceQueue, job)
  )
  checkExternalServiceQueue.on('error', onCheckError)
  checkExternalServiceQueue.on('failed', onCheckQueueFailed)
  checkExternalServiceEvents.on('completed', (job) =>
    handleCheckServiceResult(checkExternalServiceQueue, job)
  )

  async function checkServiceJobs() {
    // from now on all monitors check all services
    const services = await ds.Service.findAll({
      where: { type: 'rpc', status: 'active' },
      include: ['membershipLevel'],
    })
    const members = await ds.Member.findAll({
      where: { status: 'active', membershipType: { [Op.ne]: 'external' } },
      include: ['membershipLevel'],
    })
    const internalProviders = ProvidersAggregateRoot.crossProduct(
      members,
      services,
      ({ member, service }) => member.membershipLevelId >= service.membershipLevelId
    )

    const externalMembers = await ds.Member.findAll({
      where: { status: 'active', membershipType: 'external' },
      include: ['membershipLevel'],
    })
    const memberServices = await ds.MemberService.findAll({
      where: { status: 'active' },
      include: { association: 'member', where: { membershipType: 'external' } },
    })
    const externalProviders = ProvidersAggregateRoot.fromDataStore(
      externalMembers,
      services,
      memberServices
    )

    const activeJobs = await checkServiceQueue.getActive()
    const waitingJobs = await checkServiceQueue.getWaiting()

    internalProviders.providedServices.forEach(({ member, service }) => {
      const activeJob = activeJobs.find(
        (j) => j.data.service.id === service.id && j.data.member.id === member.id
      )
      const waitingJob = waitingJobs.find(
        (j) => j.data.service.id === service.id && j.data.member.id === member.id
      )

      if (activeJob) {
        return logger.warn('WARNING: active job, skipping check for ', member.id, service.id)
      } else if (waitingJob) {
        return logger.warn('WARNING: waiting job, skipping check for ', member.id, service.id)
      }

      logger.debug('Creating new [checkService] job for', member.id, service.id)
      checkServiceQueue.add(
        'checkService',
        {
          subdomain: service.membershipLevel.subdomain,
          member,
          service,
          monitorId: peerId.toString(),
        },
        { repeat: false, ...jobRetention }
      )
    })

    externalProviders.providedServices.forEach(({ member, service, serviceUrl }) => {
      const activeJob = activeJobs.find(
        (j) => j.data.service.id === service.id && j.data.member.id === member.id
      )
      const waitingJob = waitingJobs.find(
        (j) => j.data.service.id === service.id && j.data.member.id === member.id
      )

      if (activeJob) {
        return logger.warn('WARNING: active job, skipping check for ', member.id, service.id)
      } else if (waitingJob) {
        return logger.warn('WARNING: waiting job, skipping check for ', member.id, service.id)
      }

      logger.debug('Creating new [checkExternalService] job for', member.id, service.id)
      checkExternalServiceQueue.add(
        'checkExternalService',
        {
          member,
          service,
          serviceUrl,
          monitorId: peerId.toString(),
        },
        { repeat: false, ...jobRetention }
      )
    })
  }

  // Run `updateMemberships` for once before running it repeatedly
  logger.log('Called to update memeberships')
  const updateMembershipJob = await new Queue('updateMemberships', queueOpts).add(
    'updateMemberships'
  )
  await updateMembershipJob.waitUntilFinished(new QueueEvents('updateMemberships', queueOpts))

  logger.log(`UPDATE_INTERVAL: ${UPDATE_INTERVAL / 1000} seconds`)
  // TODO: move healthCheckJobs to worker
  // if cfg.gossipResults, results will be broadcast to all peers
  await checkServiceJobs()
  setInterval(async function () {
    await checkServiceJobs()
  }, UPDATE_INTERVAL)

  // TODO move pruning to worker
  // pruning
  setInterval(async () => {
    await ds.prune()
  }, cfg.pruning.interval * 1000)
})()
