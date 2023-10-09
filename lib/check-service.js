import dns from 'node:dns'
import edns from 'evil-dns'

import { ApiPromise, WsProvider } from '@polkadot/api'
import { Logger } from './utils.js'

const logger = new Logger('utils:checkService')

export async function setDNS(domain, ip) {
  edns.add(domain, ip)
  var { address } = await lookupAsync(domain)
  logger.debug(`${domain} now resolves to ${address}, and should be ${ip}`)
}

export async function clearDNS(domain, ip) {
  logger.log(`removing eDns for ${domain}`)
  edns.remove(domain, ip)
  var { address } = await lookupAsync(domain)
  logger.log(`${domain} now resolves to ${address}\n`)
}

export class TimeoutException extends Error {
  constructor(message) {
    super(message)
    this.name = 'TimeoutException'
  }
}

// eDns has patched node:dns and not node:dns/promises
export async function lookupAsync(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) reject(err)
      resolve({ address, family })
    })
  })
}

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
    api.on('error', async (err) => {
      logger?.error(err)
      await provider.disconnect()
      return reject()
    })

    logger?.log('waiting for api...')
    api.isReady.then((api) => {
      logger?.log('api is ready...')
      return resolve(api)
    })
  })
}

export class ProviderError extends Error {
  constructor(err) {
    super(err)
    this.name = 'ProviderError'
  }
}

export class ApiError extends Error {
  constructor(err) {
    super(err)
    this.name = 'ApiError'
  }
}

export class ProviderConnectionStrategy {
  /** @type {ProviderServiceEntity} */ providerService

  constructor(providerService) {
    this.providerService = providerService
  }

  /**
   * Retrieves the endpoint for the connection
   * @returns {string}
   */
  getEndpoint() {
    throw new Error('Not implemented')
  }

  /**
   * This method runs the necessary steps to happen
   * before initializing the provider connection
   */
  async before() {}

  /**
   * This method builds and retrieves the provider, ready to
   * attempt a connection.
   * @returns {WsProvider} A Polkadot websockets provider
   */
  buildProvider() {
    return new WsProvider(this.getEndpoint(), false, {}, 10 * 1000)
  }

  /**
   * This method runs the necessary steps to happen
   * after disconnecting the provider connection
   */
  async after() {}
}

export class ServiceUrlProviderStrategy extends ProviderConnectionStrategy {
  getEndpoint() {
    return super.providerService.serviceUrl
  }
}

export class DomainProviderStrategy extends ProviderConnectionStrategy {
  /** @type {string} */ #domain
  /** @type {string} */ #subdomain

  constructor(providerService, subdomain) {
    super(providerService)
    this.#domain = `${subdomain}.dotters.network`
  }

  async before() {
    await setDNS(this.#domain, this.providerService.provider.member.serviceIpAddress)
  }

  getEndpoint() {
    return `wss://${this.#domain}/${this.providerService.service.chainId}`
  }

  async after() {
    await clearDNS(this.#domain, this.providerService.provider.member.serviceIpAddress)
  }
}
