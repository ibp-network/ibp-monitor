import { toString as uint8ArrayToString } from 'uint8arrays'
import { fromString as uint8ArrayFromString } from 'uint8arrays'
import { pipe } from 'it-pipe'
import map from 'it-map'
import { Logger } from './utils/logger.js'

export * from './utils/logger.js'

async function asyncForeach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index)
  }
}

// outbound message
async function stringToStream(string, stream) {
  // console.debug('stringToStream()', string, stream)
  pipe(
    [uint8ArrayFromString(string)],
    stream,
    // Sink function
    async function (source) {
      // For each chunk of data
      for await (const data of source) {
        // Output the data
        Logger.logger.log('received echo:', uint8ArrayToString(data.subarray()))
      }
    }
  )
}

// inbound message
async function streamToString(stream) {
  // console.debug('streamToString()', stream)
  let ret = ''
  await pipe(
    stream?.source,
    (source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
    // Sink function
    async (source) => {
      // For each chunk of data
      for await (const chunk of source) {
        ret = ret + chunk.toString()
      }
    }
  )
  return ret
}

function shortStash(stash = '') {
  if (!stash || stash.length < 10) return stash
  return stash.slice(0, 5) + '...' + stash.slice(-5)
}

export { asyncForeach, streamToString, stringToStream, shortStash }
