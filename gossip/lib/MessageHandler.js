import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { DataStore } from './DataStore.js'

class MessageHandler {

  datastore = undefined //= new DataStore({ initialiseDb: true })

  constructor(config) {
    console.log('MessageHandler()', config)
    this.datastore = config?.datastore || new DataStore({ initialiseDb: true })
    // this.datastore = new DataStore({ initialiseDb: true })
    // console.log('MessageHandler()', this.datastore)
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

      // a peer has published their services
      case '/ibp/services':
        const services = JSON.parse(uint8ArrayToString(evt.detail.data)) || []
        // console.debug('/ibp/services', evt.detail.from.toString(), services)
        // `touch` the peer model
        await this.datastore.peer.upsert({ peerId: evt.detail.from.toString() })
        for (var i = 0; i < services.length; i++) {
          var service = services[i]
          // console.log(service)
          let model = { ...service, peerId: evt.detail.from.toString() }
          console.log('serviceModel for upsert', model)
          await this.datastore.service.upsert(model)
        }
        break

      // a peer has published some results
      case '/ibp/healthCheck':
        const record = JSON.parse(uint8ArrayToString(evt.detail.data))
        const model = {
          peerId: evt.detail.from.toString(),
          serviceId: record.serviceId,
          record
        }
        console.log('handleMessage: /ibp/healthCheck', model)
        // await this.datastore.insertHealthCheck(evt.detail.from.toString(), model)
        await this.datastore.healthCheck.create(model)
        break

      default:
        console.log(`received: ${uint8ArrayToString(evt.detail.data)} from ${evt.detail.from.toString()} on topic ${evt.detail.topic}`)
    }
  }

}

export {
  MessageHandler
}
