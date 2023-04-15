import fs from 'fs'
import { createEd25519PeerId, createFromJSON, createFromPrivKey } from '@libp2p/peer-id-factory'

import { DataStore } from './data/data_store.js'
import { HttpHandler } from './lib/http_handler.js'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
console.log('VERSION', pkg.version)

import { config } from './config/config.js'
import { configLocal } from './config/config.local.js'
const cfg = Object.assign(config, configLocal)

// set this in docker-compose.yml?
const HTTP_PORT = process.env.HTTP_PORT || 30002

const ds = new DataStore({ pruning: cfg.pruning })
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
    fs.writeFileSync(
      './keys/peerId.json',
      JSON.stringify({
        id: peerId.toString(),
        privKey: uint8ArrayToString(peerId.privateKey, 'base64'), // .toString(),
        pubKey: uint8ArrayToString(peerId.publicKey, 'base64'), // .toString()
      }),
      'utf-8'
    )
  }
  console.debug('Our monitorId', peerId.toString())
  hh.setLocalMonitorId(peerId.toString())

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
    }) // CTRL+C
  })
})()
