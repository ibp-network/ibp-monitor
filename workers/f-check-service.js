'use strict'

import { Job } from 'bullmq'
import { ApiPromise, WsProvider } from '@polkadot/api'

import cfg from '../config/index.js'

import { ProviderServiceEntity } from '../domain/provider-service.entity.js'

import { HealthChecker, retry, asyncCallWithTimeout } from '../lib/check-service/index.js'
import { Logger } from '../lib/utils.js'

const logger = new Logger('worker:checkService')

/**
 *
 * @param {Job} job
 * @param {Object} params
 * @param {HealthChecker} params.healthChecker
 * @param {ProviderServiceEntity} params.providerService
 */
async function performCheck(job, { healthChecker, providerService }) {
  job.log(`checkService: ${providerService}`)

  /** @type {WsProvider?} */ let provider
  /** @type {ApiPromise?} */ let api
  try {
    provider = await healthChecker.buildProvider()

    job.log('connecting to provider...')
    await asyncCallWithTimeout(healthChecker.connectProvider(provider), 15 * 1_000)
    job.log('provider is ready!')

    job.updateProgress(25)

    api = await healthChecker.buildApi(provider)

    job.log('connecting to api...')
    await asyncCallWithTimeout(healthChecker.connectApi(api), 15 * 1_000)
    job.log('api is ready...')

    job.updateProgress(60)

    logger.log('getting stats from provider / api...')
    job.log('getting stats from provider / api...')
    const result = await healthChecker.tryCheck(api, cfg.performance?.sla)

    job.updateProgress(100)

    await api?.disconnect()
    await provider?.disconnect()
    await healthChecker.connectionStrategy.after()

    return result
  } catch (err) {
    await api?.disconnect()
    await provider?.disconnect()
    await healthChecker.connectionStrategy.after()

    logger.error(err)
    job.log('>> got error for ', healthChecker.connectionStrategy.getEndpoint())
    job.log(err.toString())

    throw err
  }
}

/**
 * Similar to healthCheck-endpoint, but for IBP url at member.services_address
 * @param {Job} job
 * @returns
 */
export async function checkService(job) {
  /** @type {ProviderServiceEntity} */
  const providerService = job.data.providerService
  const {
    service: { id: serviceId },
    provider: { id: providerId },
  } = providerService

  /** @type {string} */
  const monitorId = job.data.monitorId

  logger.debug(`Checking ${serviceId} for ${providerId}`)
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

    logger.log(`Done checking ${serviceId} for ${providerId}`)
    job.log(`[checkService] Done checking ${serviceId} for ${providerId}`)

    return result
  } catch (err) {
    logger.warn('WE GOT AN ERROR AFTER RETRIES')
    logger.error(err)
    job.log('WE GOT AN ERROR AFTER RETRIES --------------')
    job.log(err)
    job.log(err.toString())

    logger.log(`Done checking ${serviceId} for ${providerId} with error`)
    job.log(`[checkService] Done checking ${serviceId} for ${providerId} with error`)

    return healthChecker.errorCheck()
  }
}
