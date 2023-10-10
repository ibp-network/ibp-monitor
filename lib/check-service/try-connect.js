import { WsProvider, ApiPromise } from '@polkadot/api'
import { Logger } from '../utils.js'

/**
 *
 * @param {WsProvider} provider The provider to attempt connection from
 * @returns {Promise<void>} It resolves
 */
export function tryConnectProvider(provider) {
  // any error is 'out of context' in the handler and does not stop the `await provider.isReady`
  // provider.on('connected | disconnected | error')
  // https://github.com/polkadot-js/api/issues/5249#issue-1392411072
  return new Promise((resolve, reject) => {
    provider.on('disconnected', reject)
    provider.on('error', reject)
    provider.on('connected', () => resolve())

    provider.connect()
  })
}

/**
 *
 * @param {ApiPromise} api The API to try connect to
 * @param {Logger?} logger A logger to send messages
 * @returns {Promise<ApiPromise>} It resolves if connection is successful, rejects otherwise
 * (also, disconnecting provider)
 */
export function tryConnectApi(api, logger) {
  return new Promise((resolve, reject) => {
    api.on('disconnect', async (err) => {
      logger?.error(err)
      return reject()
    })
    api.on('error', async (err) => {
      logger?.error(err)
      return reject()
    })

    logger?.log('waiting for api...')
    api.isReady.then((api) => {
      logger?.log('api is ready...')
      return resolve(api)
    })
  })
}
