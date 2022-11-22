
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
// import { Noise } from '@libp2p/noise' // @deprecated
import { noise } from "@chainsafe/libp2p-noise"
import { mplex } from '@libp2p/mplex'

import { gossipsub, GossipSub } from '@chainsafe/libp2p-gossipsub'
import { pipe } from 'it-pipe'

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

// async function streamToString (stream) {
//   let ret = ''
//   await pipe(
//     stream.source,
//     (source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
//     // Sink function
//     async (source) => {
//       // For each chunk of data
//       for await (const chunk of source) {
//         ret = ret + chunk.toString()
//       }
//     }
//   )
//   return ret
// }

var counter = 0;

(async () => {

  const gsub = gossipsub({
    debugName: 'gossipsub!!',
    emitSelf: false,
    gossipIncoming: true,
    fallbackToFloodsub: true,
    floodPublish: true,
    doPX: true,
    allowPublishToZeroPeers: true,
    // msgIdFn: (message) => {
      // console.log('mdgIdFn', message)
      // return message.from + message.sequenceNumber?.toString(16) // 'hex'
    // },
    // msgIdFn: () => uint8ArrayToString(++counter),
    signMessages: true,
    strictSigning: true,
    // messageCache: false,
    // scoreParams: {},
    // directPeers: [],
    allowedTopics: [ '/fruit' ]
  });

  const libp2p = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
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
    peerDiscovery: [
      // bootstrap({
      //   list: [ // a list of bootstrap peer multiaddrs to connect to on node startup
      //     "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
      //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
      //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa"
      //   ],
      //   timeout: 1000, // in ms,
      //   tagName: 'bootstrap',
      //   tagValue: 50,
      //   tagTTL: 120000 // in ms
      // }),
      mdns({
        interval: 20e3
      })
    ],
    pubsub: gsub
  })

  await libp2p.start()
  console.log(libp2p.getMultiaddrs())

  // libp2p.addEventListener('peer:discovery', function (peerId) {
  //   // console.log('found peer: ', JSON.stringify(peerId) ) // .toString() ) // peerId.toB58String())
  //   console.log('found peer: ', peerId.detail.id.toString())
  //   // console.log(gsub.peers)
  //   // libp2p.pubsub.addEventListener('subscription-change') = gsub
  //   libp2p.pubsub.peers.add(peerId)
  // })
  // libp2p.handle('/fruit', async (stream, connection) => {
  //   const message = await streamToString(stream)
  //   console.log('handle /fruit', message, 'from', connection.remotePeer)
  // })

  // gsub.addEventListener('gossipsub:heartbeat')
  // libp2p.pubsub.addEventListener('subscription-change', (data) => {
  //   console.log('subscription-change', data)
  // })
  // libp2p.pubsub.addEventListener('gossipsub:message', async (event) => {
  //   const {propagationSource, msgId, msg} = event
  //   console.log('gossipsub:message', event, propagationSource, msgId, msg)
  // })

  libp2p.pubsub.addEventListener('message', async (evt) => {
    console.log(`received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
  })

  await libp2p.pubsub.subscribe('/fruit')

  setInterval(async () => {
    console.log('sending some fruit')
    const topics = libp2p.pubsub.getTopics()
    // console.log('topics', topics)
    
    // console.log(gsub.gossip, 'messages waiting')
    // console.log(gsub.publishedMessageIds, 'messages publishedMessageIds')
    
    const res = await libp2p.pubsub.publish('/fruit', uint8ArrayFromString(JSON.stringify({
      sender: libp2p.peerId.toString(),
      id: ++counter,
      type: 'banana'
    })))
    // const res = await libp2p.pubsub.publish('/fruit', new TextEncoder().encode('banana'))
    // console.log('got', res)

  }, 3000)

})()
