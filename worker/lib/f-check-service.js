'use strict'

import dns from 'node:dns'
import edns from 'evil-dns'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { serializeError } from 'serialize-error'

import { config as cfg } from '../config.js'

// eDns has patched node:dns and not node:dns/promises
async function lookupAsync(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) reject(err)
      resolve({ address, family })
    })
  })
}

const setDNS = async (domain, ip) => {
  edns.add(domain, ip)
  var { address } = await lookupAsync(domain)
  console.debug(`${domain} now resolves to ${address}, and should be ${ip}`)
}
const clearDNS = async (domain, ip) => {
  console.log(`removing eDns for ${domain}`)
  edns.remove(domain, ip)
  var { address } = await lookupAsync(domain)
  console.log(`${domain} now resolves to ${address}\n`)
}

class TimeoutException extends Error {
  constructor(message) {
    super(message)
    this.name = 'TimeoutException'
  }
}

/**
 * Similar to healthCheck-endpoint, but for IBP url at member.services_address
 * @param {} job
 * @returns
 */
export async function checkService(job) {
  // Will print { foo: 'bar'} for the first job
  // and { qux: 'baz' } for the second.
  // console.log('job.data', job.data);

  const { subdomain, member, service, monitorId } = job.data
  console.debug('[worker] checkService', subdomain, member.id, service.id)

  // const service = services[domain]
  const domain = `${subdomain}.dotters.network`
  const endpoint = `wss://${domain}/${service.chainId}`
  //const service_address = member.services_address
  //console.debug('address', service_address)

  var timeout = null
  var result
  var peerId = ''
  // TODO different types of service? http / substrate / ...?
  try {
    job.log(`checkService: ${domain}, ${member.id}, ${service.id}`)

    // amend DNS
    await setDNS(domain, member.serviceIpAddress)

    // catch & throw promise reject()
    // const provider = new WsProvider(service.serviceUrl, false, {}, 10 * 1000) // 10 seconds timeout
    const provider = new WsProvider(endpoint, false, {}, 10 * 1000) // 10 seconds timeout
    // any error is 'out of context' in the handler and does not stop the `await provider.isReady`
    // provider.on('connected | disconnected | error')
    job.log('connecting to provider...')
    // https://github.com/polkadot-js/api/issues/5249#issue-1392411072
    await new Promise((resolve, reject) => {
      // provider.on('disconnected', () => {
      //   job.log('provider disconnected...')
      //   console.log('provider disconnected')
      //   resolve()
      // })
      provider.on('error', async (err) => {
        job.log('== got providerError for ', service.serviceUrl)
        job.log(err.toString())
        // result = handleProviderError(err, service, peerId)
        // await provider.disconnect()
        // throw new Error(err)
        reject(err)
      })
      provider.on('connected', () => {
        resolve()
      })
      provider.connect()
    })
    job.log('waiting for ready...')
    await provider.isReady
    job.log('provider is ready...')

    job.log('connecting to api...')
    const api = await ApiPromise.create({ provider, noInitWarn: true, throwOnConnect: true })
    // api.on('error', function (err) { throw new ApiError(err.toString()) })
    api.on('error', async (err) => {
      job.log('== got apiError for ', service.serviceUrl)
      job.log(err)
      console.log('== got apiError for ', service.serviceUrl)
      console.log(err)
      // result = handleProviderError(err, service, peerId)
      await provider.disconnect()
      // throw new Error(err)
    })
    job.log('waiting for api...')
    await api.isReady
    job.log('api is ready...')

    // handle Timeout 30 seconds
    timeout = setTimeout(async () => {
      // throw new TimeoutException('function timeout, 30 seconds')
      console.debug('[worker] TimeoutException')
      job.log('TimeoutException')
      await api.disconnect()
      await provider.disconnect()
      await job.discard()
      return { error: 'TimeoutException' }
    }, 70 * 1000) // job should timeout based on jobOpts anyway

    job.log('getting stats from provider / api...')

    peerId = await api.rpc.system.localPeerId()
    const chain = await api.rpc.system.chain()

    // start
    var start = performance.now()
    const health = await api.rpc.system.health()
    var end = performance.now()
    // end timer

    const networkState = api.rpc.system.networkState // () // not a function?
    const syncState = await api.rpc.system.syncState()
    const finalizedBlockHash = await api.rpc.chain.getFinalizedHead()
    const { number: finalizedBlock } = await api.rpc.chain.getHeader(finalizedBlockHash)
    const version = await api.rpc.system.version()

    // check if node is archive by querying a random block 
    const randBlockNumber =  Math.floor(Math.random() * (finalizedBlock / 2)) + 1;
    const block_hash = await api.rpc.chain.getBlockHash(randBlockNumber)
    const runtimeVersion = await api.rpc.state.getRuntimeVersion(block_hash)
    const archiveState = {
      randomBlock: randBlockNumber,
      specVersion: runtimeVersion.specVersion.toString()
    }
    
    const timing = end - start

    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId,
      serviceId: service.id,
      memberId: member.id,
      peerId: peerId.toString(),
      source: 'check',
      type: 'service_check',
      status: timing > (cfg.performance?.sla || 500) ? 'warning' : 'success',
      responseTimeMs: timing,
      record: {
        monitorId,
        memberId: member.id,
        serviceId: service.id,
        endpoint,
        ipAddress: member.serviceIpAddress,
        chain,
        health,
        networkState,
        syncState,
        finalizedBlock,
        archiveState,
        version,
        performance: timing,
      },
    }
    await provider.disconnect()
    // not here, we'll do it in the app-server
    // await this.datastore.Service.update({ status: 'online' }, { where: { serviceUrl: service.serviceUrl } })
    // save healthCheck in storage
    // console.debug('checkService() done 1')
  } catch (err) {
    console.warn('[worker] WE GOT AN ERROR --------------')
    console.error(err)
    job.log('WE GOT AN ERROR --------------')
    job.log(err)
    job.log(err.toString())
    // mark the service errorCount
    // result = await this.handleGenericError(err, service, peerId)
    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck message
      monitorId,
      serviceId: service.id,
      memberId: member.id,
      peerId: peerId?.toString() || null,
      source: 'check',
      type: 'service_check',
      status: 'error',
      record: {
        monitorId,
        memberId: member.id,
        serviceId: service.id,
        endpoint,
        ip_address: member.serviceIpAddress,
        error: serializeError(err),
        performance: -1,
      },
    }
  } finally {
    if (timeout) clearTimeout(timeout)
    await clearDNS(domain, member.serviceIpAddress)
    console.log('[worker] checkService done...', member.id, service.id)
    job.log('checkService done...', member.id, service.id)
    return result
  }
}
