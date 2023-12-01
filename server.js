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
import chalkTemplate from 'chalk-template'
import { ProviderEntity } from './domain/provider.entity.js'
import { ServiceEntity } from './domain/service.entity.js'
import { ProviderServiceEntity } from './domain/provider-service.entity.js'
import { HealthCheckEntity } from './domain/health-check.entity.js'
import { MemberEntity } from './domain/member.entity.js'
import {
  DAY_AS_MILLISECONDS,
  MINUTE_AS_MILLISECONDS,
  SECOND_AS_MILLISECONDS,
} from './lib/consts.js'

const cfg = Object.assign(config, configLocal)
const logger = new Logger('server')

const queueOpts = {
  connection: cfg.redis,
}
const jobRetention = {
  /** active jobs timeout */
  timeout: 1 * MINUTE_AS_MILLISECONDS,
  removeOnComplete: {
    /** time keep up to */
    age: 5 * DAY_AS_MILLISECONDS,
    /** amount of jobs to keep up at the same time */
    count: 10_000,
  },
  removeOnFail: {
    /** time keep up to */
    age: 5 * DAY_AS_MILLISECONDS,
  },
}

const UPDATE_INTERVAL = cfg.updateInterval || 10 * MINUTE_AS_MILLISECONDS

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
        timeout: 3 * SECOND_AS_MILLISECONDS,
        tagName: 'bootstrap',
        tagValue: 50,
        tagTTL: 120 * SECOND_AS_MILLISECONDS,
      }),
      pubsubPeerDiscovery({
        interval: 10 * SECOND_AS_MILLISECONDS, // is it ms?
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
  const checkServiceEvents = new QueueEvents('checkService', queueOpts)

  const handleCheckServiceResult = async (queue, { jobId }) => {
    const job = await Job.fromId(queue, jobId)

    /** @type {ProviderServiceEntity} */
    const { provider, service } = job.data.providerService

    if (!job.returnvalue) {
      return
    }
    /** @type {HealthCheckEntity} */
    const result = job.returnvalue

    logger.log(
      chalkTemplate`{magenta.bold handleCheckServiceResult(${queue.name}, ${jobId}):}
      {bold Monitor ID:} ${result.monitorId}
      {bold Service ID:} ${result.serviceId}
      {bold Member ID:} ${result.memberId}
      {bold Status:} ${result.status}
      {bold Response time:} ${result.responseTimeMs?.toFixed(2) || NaN}ms
    `
    )

    // we could get hc for monitor that has not connected yet
    if (result.monitorId) {
      let monitor = await ds.Monitor.upsert(
        { id: result.monitorId, multiaddress: [], status: 'active' },
        { fields: ['status'] }
      )
    }

    // upsert member service node
    if (result.peerId) {
      let providerService = await ds.ProviderService.findOne({
        where: { serviceId: service.id },
      }).then((providerService) =>
        providerService !== null ? new ProviderServiceEntity(providerService) : null
      )

      // FIXME: we need to add a memberService from the memnbers.json file
      if (!providerService) {
        logger.error('No providerService for', provider.id, service.id)
        return
      }
      await ds.ProviderServiceNode.upsert(
        {
          peerId: result.peerId,
          serviceId: service.id,
          providerId: provider.id,
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
        `[gossip] publishing healthCheck: ${provider.id} ${service.id} to /ibp/healthCheck`
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

  async function checkServiceJobs() {
    // from now on all monitors check all services
    const services = await ds.Service.findAll({
      where: { type: 'rpc', status: 'active' },
      include: ['membershipLevel'],
    }).then((services) => services.map((service) => new ServiceEntity(service)))
    const providers = await ds.Provider.findAll({
      where: { status: 'active' },
      include: [
        {
          association: 'member',
          model: ds.Member,
          include: ['membershipLevel'],
        },
      ],
    }).then((providers) =>
      providers.map(
        (provider) =>
          new ProviderEntity(
            provider,
            provider.member ? new MemberEntity(provider.member) : undefined
          )
      )
    )
    const storedProviderServices = await ds.ProviderService.findAll({
      where: { status: 'active' },
      include: ['provider'],
    })

    const memberProviders = ProvidersAggregateRoot.crossProduct(
      providers.filter((provider) => provider.member),
      services,
      ({ provider, service }) => provider.member.membershipLevelId >= service.membershipLevelId
    )
    const nonMemberProviders = ProvidersAggregateRoot.fromDataStore(
      providers.filter((provider) => !provider.member),
      services,
      storedProviderServices,
      ({ provider, service }) => provider !== undefined && service !== undefined
    )

    const activeJobs = await checkServiceQueue.getActive()
    const waitingJobs = await checkServiceQueue.getWaiting()

    const providerServices = memberProviders.concat(nonMemberProviders)
    providerServices.providerServices.forEach((providerService) => {
      const { provider, service } = providerService

      const activeJob = activeJobs.find(
        (j) =>
          j.data.providerService.provider.id === providerService.provider.id &&
          j.data.providerService.service.id === providerService.service.id
      )
      const waitingJob = waitingJobs.find(
        (j) =>
          j.data.providerService.provider.id === providerService.provider.id &&
          j.data.providerService.service.id === providerService.service.id
      )

      if (activeJob) {
        return logger.warn('WARNING: active job, skipping check for ', provider.id, service.id)
      } else if (waitingJob) {
        return logger.warn('WARNING: waiting job, skipping check for ', provider.id, service.id)
      }

      logger.debug('Creating new [checkService] job for', provider.id, service.id)
      checkServiceQueue.add(
        'checkService',
        {
          providerService,
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
  }, cfg.pruning.interval * SECOND_AS_MILLISECONDS)
})()
