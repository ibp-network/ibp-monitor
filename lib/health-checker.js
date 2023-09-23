import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api'
import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'
const cfg = Object.assign(config, configLocal)

class ProviderError extends Error {
  constructor(err) {
    super(err)
    this.name = 'ProviderError'
  }
}
class ApiError extends Error {
  constructor(err) {
    super(err)
    this.name = 'ApiError'
  }
}
class HealthChecker {
  localMonitorId = undefined
  datastore = undefined

  constructor({ datastore }) {
    // TODO customise the logger for debug
    // this.services = services
    this.datastore = datastore
  }

  addService() {}
  deleteService() {}

  setLocalMonitorId(localMonitorId) {
    this.localMonitorId = localMonitorId
  }

  async getServiceId(url = '') {
    const provider = new WsProvider(url)
    const api = await ApiPromise.create({ provider })
    await api.isReady
    const serviceId = await api.rpc.system.localPeerId()
    await api.disconnect()
    await provider.disconnect()
    return serviceId.toString()
  }

  async handleProviderError(err, member, service, peerId) {
    console.error('provider.on:error', JSON.stringify(err))
    console.debug('provider.on:error', service, peerId)
    // throw new ProviderError(err.toString())
    const svc = await this.datastore.Service.findByPk(service.id)
    // await svc.increment('errorCount', { by: 1 })
    var result = {
      monitorId: this.localMonitorId, // .toString(),
      memberId: member.id,
      serviceId: service.id,
      peerId: peerId ? peerId.toString() : null, // probably won't know this...?
      source: 'check',
      level: 'error',
      checkOrigin: member.membershipType !== 'external' ? 'member' : 'external',
      record: {
        monitorId: this.localMonitorId, // .toString(),
        serviceUrl: service.serviceUrl,
        service,
        error: JSON.parse(JSON.stringify(err)),
      },
    }
    // TODO gossip this !!
    await this.datastore.HealthCheck.create(result)
    return Promise.resolve(result)
  }

  async handleApiError(...args) {
    console.debug('handleApiError', args)
  }

  async handleGenericError(...args) {
    console.debug('handleGenericError', args)
  }

  /**
   * @deprecated
   * Run the HealthCheck process on each peer service
   * @param {*} services - array of services for a peer
   * @returns array of results
   */
  async check(services = []) {
    var results = []
    // await asyncForeach(services, async (service) => {
    console.debug('check() # services', services.length)
    for (var i = 0; i < services.length; i++) {
      const service = services[i]
      console.debug('checking service', service.serviceUrl, service.status)
      if (['stale', 'maintenance'].includes(service.status)) continue
      var result
      var peerId
      // TODO different types of service? http / substrate / ...?
      try {
        console.debug('HealthCheck.check()', service.serviceUrl)

        // catch & throw promise reject()
        const provider = new WsProvider(service.serviceUrl, false, {}, 10 * 1000) // 10 seconds timeout
        // any error is 'out of context' in the handler and does not stop the `await provider.isReady`
        provider.on('error', async (err) => {
          console.log('== got providerError for ', service.serviceUrl)
          result = await this.handleProviderError(err, service, peerId)
          // provider.disconnect()
        })
        console.debug('connecting to provider...')
        await provider.connect()
        console.debug('waiting for ready...')
        await provider.isReady
        console.debug('provider is ready...')

        const api = await ApiPromise.create({ provider })
        // api.on('error', function (err) { throw new ApiError(err.toString()) })
        api.on('error', (args) => {
          this.handleApiError(args)
        })
        await api.isReady

        console.debug('getting stats from provider / api...')
        peerId = await api.rpc.system.localPeerId()
        // console.log('localPeerId', localPeerId.toString())
        await this.datastore.Peer.upsert({
          peerId: peerId.toString(),
          serviceUrl: service.serviceUrl,
        })
        const chain = await api.rpc.system.chain()
        const chainType = await api.rpc.system.chainType()
        // start
        var start = performance.now()
        const health = await api.rpc.system.health()
        var end = performance.now()
        // end timer
        // let peerCount = -1
        // try {
        //   peerCount = await api.rpc.net.peerCount()
        //   console.log('peerCount ------------', peerCount)
        //   // const peers = await api.rpc.system.peers() // unsafe RPC call
        //   // console.log('peers ----------------', peers.toJSON())
        // } catch(err) {
        //   console.error(err)
        // }
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
          checkOrigin: member.membershipType !== 'external' ? 'member' : 'external',
          level: timing > (cfg.performance?.sla || 500) ? 'warning' : 'success',
          record: {
            monitorId: this.localMonitorId, // .toString(),
            serviceUrl: service.serviceUrl,
            chain,
            chainType,
            health,
            networkState,
            syncState,
            version,
            // peerCount,
            performance: timing,
          },
        }
        await provider.disconnect()
        await this.datastore.Service.update(
          { status: 'online' },
          { where: { serviceUrl: service.serviceUrl } }
        )
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
    }
    // console.log(results)
    return results
  }
}

export { HealthChecker }
