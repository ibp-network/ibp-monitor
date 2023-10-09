'use strict'

import cfg from '../config/index.js'
import { Logger } from '../lib/utils.js'
import { ProviderServiceEntity } from '../domain/provider-service.entity.js'
import { HealthChecker } from '../lib/health-checker.js'
import { TimeoutException } from '../lib/check-service.js'

const logger = new Logger('worker:checkService')

async function retry(fn, job, retriesLeft = 3, interval = 1000) {
  try {
    return await fn()
  } catch (error) {
    // typically a timeout error
    logger.log('attempt', retriesLeft)
    logger.error(error, error.stack)
    job.log('attempt', retriesLeft)
    job.log(error)
    if (retriesLeft) {
      // Wait interval milliseconds before next try
      await new Promise((resolve) => setTimeout(resolve, interval))
      return retry(fn, job, retriesLeft - 1, interval)
    } else {
      throw new Error('Max retries exceeded')
    }
  }
}

/**
 *
 * @param {Object} params
 * @param {NodeJS.Timeout?} params.timeout
 * @param {HealthChecker} params.healthChecker
 * @param {ProviderServiceEntity} params.providerService
 */
async function performCheck(job, params) {
  const { healthChecker, providerService } = params
  job.log(`checkService: ${providerService}`)

  try {
    logger.log('connecting to provider...')
    job.log('connecting to provider...')
    const provider = await healthChecker.connectProvider()
    logger.log('provider is ready...')
    job.log('provider is ready...')

    const api = await healthChecker.buildApi(provider)

    /** @type {NodeJS.timeoutHandle} */ let timeoutHandle
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(async () => {
        await api.disconnect()
        await provider.disconnect()
        await healthChecker.connectionStrategy.after()
        await job.discard()

        reject(new TimeoutException())
      }, 70 * 1000)
    })

    logger.log('connecting to api...')
    job.log('connecting to api...')
    await Promise.race([healthChecker.connectApi(api), timeoutPromise]).then(() => {
      clearTimeout(timeoutHandle)
    })
    logger.log('api is ready...')
    job.log('api is ready...')

    logger.log('getting stats from provider / api...')
    job.log('getting stats from provider / api...')
    const result = await healthChecker.tryCheck(api, cfg.performance?.sla)

    await api.disconnect()
    await provider.disconnect()
    await healthChecker.connectionStrategy.after()

    return result
  } catch (err) {
    logger.error(err, err.stack)
    job.log('== got error for ', healthChecker.connectionStrategy.getEndpoint())
    job.log(err.toString())

    throw err
  }
}

/**
 * Similar to healthCheck-endpoint, but for IBP url at member.services_address
 * @param {} job
 * @returns
 */
export async function checkService(job) {
  /** @type {ProviderServiceEntity} */
  const providerService = job.data.providerService
  /** @type {string} */
  const monitorId = job.data.monitorId

  logger.debug('Start checking', providerService)
  const healthChecker = new HealthChecker({
    monitorId,
    providerService,
  })

  try {
    const result = await retry(
      () =>
        performCheck(job, {
          healthChecker,
          providerService,
        }),
      job,
      3, // retry 3 times
      5 * 1000 // wait 5 seconds between each try
    )

    logger.log('Done', providerService)
    job.log('[checkService] Done', providerService)

    return result
  } catch (err) {
    logger.warn('WE GOT AN ERROR AFTER RETRIES --------------')
    logger.error(err)
    job.log('WE GOT AN ERROR AFTER RETRIES --------------')
    job.log(err)
    job.log(err.toString())

    logger.log('Done with error', providerService)
    job.log('[checkService] Done with error', providerService)

    return healthChecker.errorCheck()
  }
}
