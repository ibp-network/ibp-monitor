// import _Vue from 'vue'
// import { createLibp2p } from 'libp2p'
// import { webSockets } from '@libp2p/websockets'
// // import { webRTCStar } from '@libp2p/webrtc-star'
// // import { webRTCDirect } from '@libp2p/webrtc-direct'
// // import { webRTC } from '@libp2p/webrtc'
// // import wrtc from 'wrtc' // not needed on the listener?
// import { noise } from '@chainsafe/libp2p-noise'
// import { mplex } from '@libp2p/mplex'
// // import Gossipsub from 'libp2p-gossipsub' // @deprecated!
// import { gossipsub, GossipsubOpts } from '@chainsafe/libp2p-gossipsub'
// // import Bootstrap from 'libp2p-bootstrap'
// import { bootstrap } from '@libp2p/bootstrap'
// import { kadDHT } from '@libp2p/kad-dht'
// // import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
// // import pipe from 'it-pipe')

// import store from '../store'

// const gso = {
//   // emitSelf: false, // don't want our own pubsub messages
//   // gossipIncoming: true,
//   // fallbackToFloodsub: true,
//   // floodPublish: true,
//   // doPX: true,
//   // allowPublishToZeroPeers: true,
//   // signMessages: true, // TODO: how can we test this?
//   // strictSigning: true,
//   // messageCache: false,
//   // scoreParams: {},
//   // directPeers: [],
//   // allowedTopics: [ '/fruit' ]
//   allowedTopics: ['/ibp', '/ibp/services', '/ibp/healthCheck']
// } as GossipsubOpts

// export async function Libp2pPlugin (Vue: typeof _Vue, options?: any): Promise<void> {
//   // const wrtcStar = webRTCStar()
//   const gsub = gossipsub(gso)
//   // const peerId = store.state.libp2p.peerId
//   const libp2p = await createLibp2p({
//     addresses: {
//       listen: [
//         // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
//         // '/ip4/192.168.1.91/tcp/30001/wss/p2p-webrtc-star'
//       ]
//     },
//     transports: [
//       // webRTCDirect(),
//       // webRTC(),
//       webSockets(),
//       wrtcStar.transport
//     ],
//     connectionEncryption: [noise()],
//     // does web need a stream muxer?
//     // streamMuxers: [
//     //   mplex()
//     // ],
//     connectionManager: {
//       pollInterval: 2000
//     },
//     peerDiscovery: [
//       // wrtcStar.discovery,
//       bootstrap({
//         list: [
//           // p2p-webrtc-direct
//           // '/ip4/0.0.0.0/tcp/30002/http/p2p-webrtc-direct/p2p/12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh',
//           // pubsub?
//           '/ip4/31.22.13.147/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
//           '/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu'
//         ]
//       })
//     ],
//     dht: kadDHT({
//       // randomWalk: true
//     }),
//     pubsub: gsub
//   })

//   libp2p.addEventListener('peer:discovery', async (evt: any) => {
//     console.debug('libp2p:peer:discovery', evt.detail.id.toString())
//     // try {
//     //   libp2p.connectionManager.openConnection().dialProtocol(evt.detail.multiaddrs, '/ping')
//     // } catch (err) {
//     //   console.warn('error dialing peer')
//     // }
//     store.dispatch('libp2p/peerDiscovery', evt)
//   })
//   // Listen for new connections to peers
//   libp2p.connectionManager.addEventListener('peer:connect', (evt: any) => {
//     const connection = evt.detail
//     console.debug(`Connected to ${connection.remotePeer.toString()}`)
//     store.dispatch('libp2p/peerConnect', evt)
//   })
//   // Listen for peers disconnecting
//   libp2p.connectionManager.addEventListener('peer:disconnect', (evt: any) => {
//     const connection = evt.detail
//     console.debug(`Disconnected from ${connection.remotePeer.toString()}`)
//     store.dispatch('libp2p/peerConnect', evt)
//   })
//   // handle messages
//   libp2p.pubsub.addEventListener('message', async (evt) => {
//     // await mh.handleMessage(evt)
//     store.dispatch('libp2p/pubsubMessage', evt)
//   })

//   await libp2p.start()
//   console.debug(libp2p.getMultiaddrs())

//   Vue.prototype.$libp2p = libp2p
// }

// // const plugin = {
// //   install(Vue, opts = {}) {

// //     Vue.prototype.$startLibp2p = async function () {
// //       const node = await Libp2p.create({
// //         addresses: {
// //           listen: [
// //             '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
// //             '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
// //           ]
// //         },
// //         modules: {
// //           transport: [Websockets, WebRTC],
// //           streamMuxer: [Mplex],
// //           connEncryption: [SECIO],
// //           pubsub: Gossipsub
// //         },
// //         config: {
// //           pubsub: {
// //             enabled: true,
// //             emitSelf: true
// //           }
// //         }
// //       })

// //       // Listen for new peers
// //       node.on('peer:discovery', (peerId) => {
// //         console.log(`Found peer ${peerId.toB58String()}`)
// //       })

// //       // Listen for new connections to peers
// //       node.connectionManager.on('peer:connect', (connection) => {
// //         // console.log(`Connected to ${connection.remotePeer.toB58String()}`)
// //         console.log(`Connected to ${connection.remotePeer}`)
// //       })

// //       // Listen for peers disconnecting
// //       node.connectionManager.on('peer:disconnect', (connection) => {
// //         console.log(`Disconnected from ${connection.remotePeer.toB58String()}`)
// //       })

// //       await node.start()
// //       return node

// //     }
// //   }
// // }
