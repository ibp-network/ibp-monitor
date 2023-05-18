import './dotenv.js'
import fs from 'fs'
import { createEd25519PeerId, createFromJSON } from '@libp2p/peer-id-factory'
import { DataStore } from './data/data-store.js'
import { HttpHandler } from './lib/http-handler.js'
import { MessageHandler } from './lib/message-handler.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { config } from './config/config.js'
import { config as configLocal } from './config/config.local.js'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
console.log('VERSION', pkg.version)

const cfg = Object.assign(config, configLocal)
const API_PORT = cfg.apiPort || 30002

const ds = new DataStore({ pruning: cfg.pruning })
const mh = new MessageHandler({ datastore: ds })
const hh = new HttpHandler({ datastore: ds, version: pkg.version, messageHandler: mh })

;(async () => {
  // get PeerId
  var peerId
  if (fs.existsSync('./keys/peer-id.json')) {
    const pidJson = JSON.parse(fs.readFileSync('./keys/peer-id.json', 'utf-8'))
    // console.debug(pidJson)
    peerId = await createFromJSON(pidJson)
  } else {
    peerId = await createEd25519PeerId()
    fs.writeFileSync(
      './keys/peer-id.json',
      JSON.stringify({
        id: peerId.toString(),
        privKey: uint8ArrayToString(peerId.privateKey, 'base64'),
        pubKey: uint8ArrayToString(peerId.publicKey, 'base64'),
      }),
      'utf-8'
    )
  }
  console.debug('Our monitorId', peerId.toString())
  hh.setLocalMonitorId(peerId.toString())

  // start HttpHandler
  hh.listen(API_PORT, () => {
    console.log(`\nServer is running on port ${API_PORT}, press crtl-c to stop\n`)
    process.on('SIGINT', async () => {
      console.warn('\nControl-c detected, shutting down...')
      // close the DB gracefully
      await ds.close()
      console.warn('... stopped!')
      process.exit()
    }) // CTRL+C
  })
})()
