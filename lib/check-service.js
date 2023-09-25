import dns from 'node:dns'
import edns from 'evil-dns'

import { WsProvider } from '@polkadot/api'
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
    provider.on('error', reject)
    provider.on('connected', () => resolve())

    provider.connect()
  })
}
