'use strict'

import { ApiPromise, WsProvider } from '@polkadot/api'
import { serializeError } from 'serialize-error'

import cfg from '../config/index.js'
import { Logger } from '../lib/utils.js'
import { tryConnectProvider } from '../lib/check-service.js'

const logger = new Logger('worker:checkExternalService')

/**
 * Similar to healthCheck-endpoint, but for IBP url at member.services_address
 * @param {} job
 * @returns
 */
export async function checkService(job) {
  const { member, service, monitorId, serviceUrl } = job.data
  logger.debug(member.id, service.id, serviceUrl)

  var timeout = null
  var result
  var peerId = ''

  async function retry(fn, retriesLeft = 3, interval = 1000) {
    try {
      return await fn()
    } catch (error) {
      // typically a timeout error
      logger.log('attempt', retriesLeft)
      job.log('attempt', retriesLeft)

      logger.err(error)
      job.log(error)

      if (retriesLeft) {
        // Wait interval milliseconds before next try
        await new Promise((resolve) => setTimeout(resolve, interval))
        return retry(fn, retriesLeft - 1, interval)
      } else {
        throw new Error('Max retries exceeded')
      }
    }
  }

  const performCheck = async () => {
    job.log(`Perform check for ${member.id}, ${service.id} ${serviceUrl}`)

    // 10 seconds timeout
    const provider = new WsProvider(serviceUrl, false, {}, 10 * 1000)

    try {
      job.log('connecting to provider...')
      await tryConnectProvider(provider)

      job.log('waiting for ready...')
      await provider.isReady
      job.log('provider is ready...')
    } catch (err) {
      job.log('== got providerError for ', service.serviceUrl)
      job.log(err.toString())
    }

    job.log('connecting to api...')
    const api = await ApiPromise.create({ provider, noInitWarn: true, throwOnConnect: true })

    api.on('error', async (err) => {
      job.log('== got apiError for ', service.serviceUrl)
      job.log(err)
      // result = handleProviderError(err, service, peerId)
      await provider.disconnect()
      // throw new Error(err)
    })

    job.log('waiting for api...')
    await api.isReady
    job.log('api is ready...')

    // handle Timeout n seconds
    timeout = setTimeout(async () => {
      logger.debug('[worker] TimeoutException')
      job.log('TimeoutException')
      await api.disconnect()
      await provider.disconnect()
      await job.discard()
      throw new Error('TimeoutException')
    }, 70 * 1000)

    logger.log('getting stats from provider / api...')
    job.log('getting stats from provider / api...')

    peerId = await api.rpc.system.localPeerId()
    const chain = await api.rpc.system.chain()
    const chainType = await api.rpc.system.chainType()

    // start
    var start = performance.now()
    const health = await api.rpc.system.health()
    var end = performance.now()
    // end timer

    const networkState = api.rpc.system.networkState // () // not a function?
    const syncState = await api.rpc.system.syncState()
    const finalizedBlockHash = await api.rpc.chain.getFinalizedHead()
    const { number: finalizedBlock } = await api.rpc.chain.getHeader(finalizedBlockHash)
    // const blockDrift = syncState.currentBlock.toNumber() - finalizedBlock
    const version = await api.rpc.system.version()
    const timing = end - start

    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId,
      serviceId: service.id,
      memberId: member.id,
      peerId: peerId.toString(),
      source: 'check',
      type: 'service_check',
      checkOrigin: member.membershipType !== 'external' ? 'member' : 'external',
      status: timing > (cfg.performance?.sla || 500) ? 'warning' : 'success',
      responseTimeMs: timing,
      record: {
        monitorId,
        memberId: member.id,
        serviceId: service.id,
        endpoint: serviceUrl,
        ipAddress: member.serviceIpAddress,
        chain,
        chainType,
        health,
        networkState,
        syncState,
        finalizedBlock,
        version,
        // peerCount,
        performance: timing,
      },
    }
    await provider.disconnect()
  }

  try {
    // retry 3 times, wait 5 seconds between each try
    await retry(performCheck, 3, 5 * 1000)
  } catch (err) {
    logger.warn('[worker] WE GOT AN ERROR AFTER RETRIES --------------')
    logger.error(err)

    job.log('WE GOT AN ERROR AFTER RETRIES --------------')
    job.log(err)
    job.log(err.toString())

    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck message
      monitorId,
      serviceId: service.id,
      memberId: member.id,
      peerId: peerId?.toString() || null,
      source: 'check',
      type: 'service_check',
      checkOrigin: member.membershipType !== 'external' ? 'member' : 'external',
      status: 'error',
      record: {
        monitorId,
        memberId: member.id,
        serviceId: service.id,
        endpoint: serviceUrl,
        ip_address: member.serviceIpAddress,
        error: serializeError(err),
        performance: -1,
      },
    }
  } finally {
    if (timeout) clearTimeout(timeout)
    logger.log('Check done for', member.id, service.id)
    job.log('Check done for', member.id, service.id)
    return result
  }
}
