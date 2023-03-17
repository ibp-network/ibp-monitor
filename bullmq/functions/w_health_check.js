import { Worker, Job } from 'bullmq';
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
import { DataStore } from '../../lib/DataStore';

import { config } from '../../config/config.js'
import { configLocal } from '../../config/config.local.js'
const cfg = Object.assign(config, configLocal)

async function handleApiError(args) {
  console.log('API ERROR', JSON.stringify(args))
  return args
}
async function handleProviderError(args) {
  console.log('PROVIDER ERROR', JSON.stringify(args))
  return args
}

// TODO move pruning function to worker
const ds = new DataStore({ initialiseDb: false })

const worker = new Worker(queueName, async (job) => {
  // Will print { foo: 'bar'} for the first job
  // and { qux: 'baz' } for the second.
  console.log(job.data);

  var results = []
  const { service } = job.data
  console.debug('checking service', service.serviceUrl, service.status)

  if (['stale', 'maintenance'].includes(service.status)) return {
    monitorId: this.localMonitorId,
    serviceUrl: service.serviceUrl,
    peerId: null,
    source: 'check',
    level: 'warning',
    message: service.status,
    record: {
      monitorId: this.localMonitorId,
      serviceUrl: service.serviceUrl,
      performance: -1,
    }
  }

  var result
  var peerId
  // TODO different types of service? http / substrate / ...?
  try {
    await job.log(`w_health_check(): ${service.serviceUrl}`)

    // catch & throw promise reject()
    const provider = new WsProvider(service.serviceUrl, false, {}, 10 * 1000) // 10 seconds timeout
    // any error is 'out of context' in the handler and does not stop the `await provider.isReady`
    provider.on('error', async (err) => {
      console.log('== got providerError for ', service.serviceUrl)
      result = await handleProviderError(err, service, peerId)
      // provider.disconnect()
    })

    console.debug('connecting to provider...')
    await provider.connect()
    console.debug('waiting for ready...')
    await provider.isReady
    console.debug('provider is ready...')

    const api = await ApiPromise.create({ provider })
    // api.on('error', function (err) { throw new ApiError(err.toString()) })
    api.on('error', (args) => { this.handleApiError(args) })
    await api.isReady

    console.debug('getting stats from provider / api...')
    peerId = await api.rpc.system.localPeerId()
    // console.log('localPeerId', localPeerId.toString())
    await this.datastore.Peer.upsert({ peerId: peerId.toString(), serviceUrl: service.serviceUrl})
    const chain = await api.rpc.system.chain()
    const chainType = await api.rpc.system.chainType()
    // start
    var start = performance.now()
    const health = await api.rpc.system.health()
    var end = performance.now()
    // end timer

    const networkState = api.rpc.system.networkState
    const syncState = await api.rpc.system.syncState()
    const version = await api.rpc.system.version()
    const timing = end - start
    // console.debug(health.toString())
    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId: this.localMonitorId, // .toString(),
      serviceUrl: service.serviceUrl,
      peerId: peerId.toString(),
      source: 'check',
      level: timing > (cfg.performance?.sla || 500) ? 'warning' : 'success',
      record: {
        monitorId: this.localMonitorId, // .toString(),
        serviceUrl: service.serviceUrl,
        chain, chainType, health, networkState, syncState, version,
        // peerCount,
        performance: timing,
      }
    }
    await provider.disconnect()
    await this.datastore.Service.update({ status: 'online' }, { where: { serviceUrl: service.serviceUrl } })
    // save healthCheck in storage
    console.debug('HealthCheck.check() done')
  } catch (err) {
    console.warn('WE GOT AN ERROR --------------')
    console.error(err)
    // mark the service errorCount
    result = await this.handleGenericError(err, service, peerId)
  }
  results.push(result)
  // comment this if we receive our own gossip messages
  // console.debug('creating healthChecK', result)
  const created = await this.datastore.HealthCheck.create(result)
  // console.debug('HealthCheck created', created)
    
  console.log('health_check done...', service.serviceUrl)
  return JSON.stringify(results)

});
