
import fs from 'fs'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
// import { Noise } from '@libp2p/noise' // @deprecated
import { noise } from "@chainsafe/libp2p-noise"
import { mplex } from '@libp2p/mplex'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { createEd25519PeerId, createFromJSON, createFromPrivKey } from '@libp2p/peer-id-factory'

import { config } from './config.js'
import { DataStore } from './lib/DataStore.js'
import { MessageHandler } from './lib/MessageHandler.js'
import { HealthChecker } from './lib/HealthChecker.js'
import { HttpHandler } from './lib/HttpHandler.js'
import { asyncForeach, streamToString, stringToStream } from './lib/utils.js'

const HTTP_PORT = config.httpPort || 30001
const GOSSIP_PORT = config.listenPort || 30000
const UPDATE_INTERVAL = config.updateInterval || 3000

const ds = new DataStore({ initialiseDb: false })
const hc = new HealthChecker({ datastore: ds })
const mh = new MessageHandler({ datastore: ds, api: hc })
const hh = new HttpHandler({ datastore: ds })

var counter = 0;

// peerId: [list of services]
var serviceCatalog = {};

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
  console.debug('Our peerId', peerId.toString())
  hh.setLocalPeerId(peerId.toString())
  // ensure our peerId is in the DB
  await ds.Peer.upsert({peerId: peerId.toString()})

  const gsub = gossipsub({
    emitSelf: true, // get our own pubsub messages
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
    allowedTopics: config.allowedTopics
  });

  const peerDiscovery = [
    mdns({
      interval: 20e3
    })
  ]
  if (config.bootstrapPeers && config.bootstrapPeers.length > 0) {
    peerDiscovery.push(bootstrap({
      list: config.bootstrapPeers,
      timeout: 1000, // in ms,
      tagName: 'bootstrap',
      tagValue: 50,
      tagTTL: 120000 // in ms
    }))
  }

  const libp2p = await createLibp2p({
    peerId,
    addresses: {
      listen: [
        `/ip4/0.0.0.0/tcp/${GOSSIP_PORT}`
      ]
    },
    transports: [
      new tcp()
    ],
    streamMuxers: [
      mplex()
    ],
    connectionEncryption: [
      new noise()
    ],
    peerDiscovery,
    pubsub: gsub
  })

  // not here, we'll do this in the MessageHandler()
  // // peer sends us a list of their services
  // libp2p.handle('/ibp/services', async ({ connection, stream, protocol }) => {
  //   // const peerId = connection
  //   var services = []
  //   // console.log('handle /ibp/service', connection, stream, protocol)
  //   if (stream) {
  //     const servicesStr = await streamToString(stream)
  //     services = JSON.parse(servicesStr)  
  //   }
  //   console.debug('/ibp/services', connection.remotePeer.toString(), services)
  //   // `touch` the peer model
  //   await ds.peer.upsert({ peerId: connection.remotePeer.toString() })
  //   // TODO put this in dataStore?
  //   // serviceCatalog[connection.remotePeer.toString()] = services
  //   for (var i = 0; i < services.length; i++) {
  //     var service = services[i]
  //     console.log(service)
  //     let model = { ...service, peerId: connection.remotePeer.toString() }
  //     console.log('serviceModel for upsert', model)
  //     await ds.service.upsert(model)
  //   }
  //   // libp2p.dialProtocol(connection.remotePeer, '/ibp/servicesResponse', uint8ArrayFromString(JSON.stringify(config.services)))
  // })

  await libp2p.start()
  console.debug(libp2p.getMultiaddrs())

  libp2p.addEventListener('peer:discovery', (peerId) => mh.handleDiscovery(peerId) )
  libp2p.pubsub.addEventListener('message', (evt) => mh.handleMessage(evt) )

  // subscribe to pubsub topics
  for (var i=0; i < config.allowedTopics.length; i++) {
    console.debug('subscribing to', config.allowedTopics[i])
    libp2p.pubsub.subscribe(config.allowedTopics[i])
  }

  // publish our services 
  await mh.publishServices(config.services, libp2p)
  setInterval(async () => {
    console.debug('Publishing our services')
    await mh.publishServices(config.services, libp2p)
  }, UPDATE_INTERVAL)

  // publish the results of our healthChecks
  const publishResults = async () => {
    console.debug('Publishing our healthChecks')
    libp2p.getPeers().forEach(async (peerId) => {
      console.log('our peers are:', peerId.toString())
      // try {
      //   const stream = await libp2p.dialProtocol(peerId, '/ibp/services')
      //   // console.debug('stream.stat', stream.stat)
      //   // send a direct message to each peer
      //   await stringToStream(JSON.stringify(config.services), stream)
      // } catch (err) {
      //   console.warn('GOT AN ERROR')
      //   console.error(err)
      // }
      // check services of our peers
      // const services = await ds.Service.findAll({ where: { peers: { peerId: peerId.toString() } } })
      const peer = await ds.Peer.findByPk( peerId.toString(), { include: 'services' })
      // console.debug('peer', peer)
      const results = await hc.check(peer.services) || []
      console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
        // console.debug('sent message to peer', res?.toString())
      })
    }) // === end of peers update cycle ===

    // check our own services?
    if (config.checkOwnServices) {
      console.debug('checking our own services...')
      const results = await hc.check(config.services) || []
      console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
        const model = {
          peerId: libp2p.peerId.toString(),
          serviceId: result.serviceId,
          record: result
        }
        // console.log('save our own /ibp/healthCheck', model)
        await ds.HealthCheck.create(model)
      })
    }
  } // end of publishResults()

  // pubsub should balance the # peer connections. Each node will only healthCheck its peers.
  // results will be broadcast to all peers
  // await publishResults()
  setInterval(async () => {
    await publishResults()
  }, UPDATE_INTERVAL)

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
