
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
import { MessageHandler } from './lib/MessageHandler.js'
import { HealthChecker } from './lib/HealthChecker.js'
import { asyncForeach } from './lib/utils.js'

const LISTEN_PORT = config.listenPort || 30000
const UPDATE_INTERVAL = config.updateInterval || 3000

const mh = new MessageHandler()
const hc = new HealthChecker(config.services)

var counter = 0;

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

  const gsub = gossipsub({
    emitSelf: false,
    gossipIncoming: true,
    fallbackToFloodsub: true,
    floodPublish: true,
    doPX: true,
    allowPublishToZeroPeers: true,
    signMessages: true,
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
        `/ip4/0.0.0.0/tcp/${LISTEN_PORT}`
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

  await libp2p.start()
  console.debug(libp2p.getMultiaddrs())

  libp2p.addEventListener('peer:discovery', function (peerId) {
    console.debug('found peer: ', peerId.detail.id.toString())
  })

  libp2p.pubsub.addEventListener('message', mh.handleMessage)

  for (var i=0; i < config.allowedTopics.length; i++) {
    console.debug('subscribing to', config.allowedTopics[i])
    libp2p.pubsub.subscribe(config.allowedTopics[i])
  }

  setInterval(async () => {
    console.debug('sending our updates')
    const results = await hc.check() || []
    asyncForeach(results, async (result) => {
      const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
      // console.debug('sent message to peer', res?.toString())
    })

  }, UPDATE_INTERVAL)

})()
