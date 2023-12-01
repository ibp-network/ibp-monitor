import dns from 'node:dns'
import edns from 'evil-dns'
import { Logger } from '../utils.js'

const logger = new Logger('lib:checkService:dns')

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

// eDns has patched node:dns and not node:dns/promises
export async function lookupAsync(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) reject(err)
      resolve({ address, family })
    })
  })
}
