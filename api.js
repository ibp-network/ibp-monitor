
import fs from 'fs'
import axios from 'axios'
// import { createLibp2p } from 'libp2p'
// import { bootstrap } from '@libp2p/bootstrap'
// import { mdns } from '@libp2p/mdns'
// import { tcp } from '@libp2p/tcp'
// // import { webSockets } from '@libp2p/websockets'
// // import { all as filters_all } from '@libp2p/websockets/filters'
// // import { webRTCDirect } from '@libp2p/webrtc-direct'
// // import wrtc from 'wrtc'
// // import { webRTCStar } from '@libp2p/webrtc-star'
// // import { Noise } from '@libp2p/noise' // @deprecated
// import { noise } from "@chainsafe/libp2p-noise"
// import { mplex } from '@libp2p/mplex'
// import { kadDHT } from '@libp2p/kad-dht'
// import { gossipsub } from '@chainsafe/libp2p-gossipsub'
// import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
// import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
// import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { createEd25519PeerId, createFromJSON, createFromPrivKey } from '@libp2p/peer-id-factory'

import { DataStore } from './lib/DataStore.js'
import { Op } from 'sequelize'
import { HttpHandler } from './lib/HttpHandler.js'
import { asyncForeach, streamToString, stringToStream } from './lib/utils.js'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
console.log('VERSION', pkg.version)

import { config } from './config/config.js'
import { configLocal } from './config/config.local.js'
const cfg = Object.assign(config, configLocal)

// set this in docker-compose.yml?
const HTTP_PORT = process.env.HTTP_PORT || 30002

const ds = new DataStore({ initialiseDb: false, pruning: cfg.pruning })
const hh = new HttpHandler({ datastore: ds, version: pkg.version })

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
  hh.setLocalMonitorId(peerId.toString())

  // TODO move this to a worker?
  async function updateMembers() {
    console.debug('api.js: updateMembers()...')
    // get updated members.json
    const membersResp = await axios.get('https://raw.githubusercontent.com/ibp-network/config/main/members.json')
    // console.debug(membersResp)
    if (membersResp.data) {
      for ( const [memberId, data] of Object.entries(membersResp.data.members)) {
        console.log('upserting Member', memberId)
        const {name, website, logo, membership, current_level, level_timestamp, services_address, region, latitude, longitude, payments } = data
        const record = {
          memberId,
          name, website, logo, membership, current_level, level_timestamp: level_timestamp[current_level], services_address, region, latitude, longitude
        }
        await ds.Member.upsert(record)
        // member endpoints
        if (data.endpoints) {
          for (const [serviceId, serviceUrl] of Object.entries(data.endpoints)) {
            await ds.Service.upsert({ serviceUrl, name: `${data.name} - ${serviceId}`, memberId })
          }
        }
      }
    }
  }
  await updateMembers()
  setInterval(async () => {
    await updateMembers()
  }, 30 * 60 * 1000) // 30 mins as millis

  // start HttpHandler
  hh.listen(HTTP_PORT, () => {
    // app.listen(HTTP_PORT, () => {    
    console.log(`\nServer is running on port ${HTTP_PORT}, press crtl-c to stop\n`)
    process.on('SIGINT', async () => {
      console.warn('\nControl-c detected, shutting down...')
      // close the DB gracefully
      await ds.close()
      console.warn('... stopped!')
      process.exit()
    });  // CTRL+C
  })

})()
