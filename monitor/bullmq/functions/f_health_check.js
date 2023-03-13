'use strict'

// import axios from 'axios'
// import moment from 'moment'
// import { createUrl, prepareDB, closeDB } from './utils.js'
// function slog (str) { console.log('1kv-nominators:' + str) }
// import { HealthChecker } from "./HealthChecker.js";
// const hc = new HealthChecker()

import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
// import { asyncForeach } from '../lib/utils.js'

import { config } from '../../config/config.js'
import { configLocal } from '../../config/config.local.js'
const cfg = Object.assign(config, configLocal)

class TimeoutException extends Error {
  constructor (message) {
    super(message)
    this.name = 'TimeoutException';
  }
}

export async function f_health_check (job) {
  // Will print { foo: 'bar'} for the first job
  // and { qux: 'baz' } for the second.
  // console.log('job.data', job.data);

  const { service, monitorId } = job.data
  console.debug('[worker] checking service', service.serviceUrl, service.status)

  if (['stale', 'maintenance'].includes(service.status)) return {
    monitorId,
    serviceUrl: service.serviceUrl,
    peerId: null,
    source: 'check',
    level: 'warning',
    message: service.status,
    record: {
      monitorId,
      serviceUrl: service.serviceUrl,
      //chain, chainType, health, networkState, syncState, version,
      // peerCount,
      error: 'service stale',
      performance: -1,
    }
  }

  var timeout = null
  var result
  var peerId = ""
  // TODO different types of service? http / substrate / ...?
  try {
    job.log(`f_health_check(): ${service.serviceUrl}`)

    // catch & throw promise reject()
    const provider = new WsProvider(service.serviceUrl, false, {}, 10 * 1000) // 10 seconds timeout
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
    const chainType = await api.rpc.system.chainType()
    // start
    var start = performance.now()
    const health = await api.rpc.system.health()
    var end = performance.now()
    // end timer

    const networkState = api.rpc.system.networkState // () // not a function?
    const syncState = await api.rpc.system.syncState()
    const version = await api.rpc.system.version()
    const timing = end - start
    // console.debug(health.toString())
    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId,
      serviceUrl: service.serviceUrl,
      peerId: peerId.toString(),
      source: 'check',
      level: timing > (cfg.performance?.sla || 500) ? 'warning' : 'success',
      record: {
        monitorId,
        serviceUrl: service.serviceUrl,
        chain, chainType, health, networkState, syncState, version,
        // peerCount,
        performance: timing,
      }
    }
    await provider.disconnect()
    // not here, we'll do it in the app-server
    // await this.datastore.Service.update({ status: 'online' }, { where: { serviceUrl: service.serviceUrl } })
    // save healthCheck in storage
    // console.debug('f_health_check() done 1')
  } catch (err) {
    console.warn('[worker] WE GOT AN ERROR --------------')
    console.error(err)
    job.log('WE GOT AN ERROR --------------')
    job.log(err)
    // mark the service errorCount
    // result = await this.handleGenericError(err, service, peerId)
    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId,
      serviceUrl: service.serviceUrl,
      peerId: peerId?.toString() || null,
      source: 'check',
      level: 'error',
      record: {
        monitorId,
        serviceUrl: service.serviceUrl,
        error: err ? err.toString() : 'unknown error',
        performance: -1,
      }
    }
  }

  if (timeout) clearTimeout(timeout)

  console.log('[worker] health_check done...', service.serviceUrl)
  return result
}
