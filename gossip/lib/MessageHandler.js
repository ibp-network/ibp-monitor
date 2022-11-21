import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

class MessageHandler {

  constructor() {}

  async handleMessage (evt) {
    console.log(`received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
  }

}

export {
  MessageHandler
}
