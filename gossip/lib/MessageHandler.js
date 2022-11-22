import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { DataStore } from './DataStore.js'

class MessageHandler {

  datastore = undefined //= new DataStore({ initialiseDb: true })

  constructor(config) {
    console.log('MessageHandler()', config)
    this.datastore = config?.datastore || new DataStore({ initialiseDb: true })
    // this.datastore = new DataStore({ initialiseDb: true })
    console.log('MessageHandler()', this.datastore)
  }

  /**
   * event: {
   *  signed:
   *  from: Ed25519PeerId
   *  data: Uint8Array(246)
   *  sequenceNumber: number (BigInt?)
   *  topic: string
   *  signature: Uint8Array(64)
   *  key: Uint8Array(32)
   * }
   * @param {} evt 
   */
  async handleMessage (evt) {
    // console.log(evt.detail)
    // if (peerId != self.peerId) {}
    switch (evt.detail.topic) {
      case '/ibp/services':
        console.warn('GOT MESSAGE IN HANDLER, WHY NOT IN PROTOCOL ???')
        break
      case '/ibp/healthCheck':
        const model = JSON.parse(uint8ArrayToString(evt.detail.data))
        console.log(this.datastore)
        await this.datastore.insertHealthCheck(evt.detail.from.toString(), model)
        break
      default:
        console.log(`received: ${uint8ArrayToString(evt.detail.data)} from ${evt.detail.from.toString()} on topic ${evt.detail.topic}`)
    }
  }

}

export {
  MessageHandler
}
