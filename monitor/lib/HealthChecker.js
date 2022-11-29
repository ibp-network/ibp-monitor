import { ApiPromise, WsProvider } from '@polkadot/api'
import { asyncForeach } from './utils.js'

class HealthChecker {

  // services = []
  datastore = undefined

  constructor({ datastore }) {
    // TODO customise the logger for debug
    // this.services = services
    this.datastore = datastore
  }

  addService () {}
  deleteService () {}

  async getServiceId (url = '') {
    const provider = new WsProvider(url)
    const api = await ApiPromise.create({ provider })
    await api.isReady
    const serviceId = await api.rpc.system.localPeerId()
    await api.disconnect()
    await provider.disconnect()
    return serviceId.toString()
  }

  /**
   * Run the HealthCheck process on each peer service
   * @param {*} services - array of services for a peer
   * @returns array of results
   */
  async check (services = []) {
    var results = []
    // await asyncForeach(services, async (service) => {
    console.debug('check() # services', services.length)
    for (var i = 0; i < services.length; i++) {
      const service = services[i]
      var result
      // TODO different types of service? http / substrate / ...?
      try {
        console.debug('HealthCheck.check()', service.serviceId)
        const provider = new WsProvider(service.url)
        const api = await ApiPromise.create({ provider })
        await api.isReady
        const serviceId = await api.rpc.system.localPeerId()
        // console.log('localPeerId', localPeerId.toString())
        const chain = await api.rpc.system.chain()
        const chainType = await api.rpc.system.chainType()
        // start
        var start = performance.now()
        const health = await api.rpc.system.health()
        var end = performance.now()
        // end timer
        const networkState = await api.rpc.system.networkState
        const syncState = await api.rpc.system.syncState()
        const version = await api.rpc.system.version()
        // console.debug(health.toString())
        result = {
          // our peerId will be added by the receiver of the /ibp/healthCheck messate
          serviceId: serviceId.toString(),
          url: service.url,
          chain, chainType, health, networkState, syncState, version,
          performance: end - start
        }
        await provider.disconnect()
        // save healthCheck in storage
        console.debug('HealthCheck.check() done')
      } catch (err) {
        console.error(err)
        result = {
          serviceUrl: service.serviceUrl, service, error: err
        }
      }
      results.push(result)
      await this.datastore.Check.create(result)
    }
    // console.log(results)
    return results
  }

}

export {
  HealthChecker
}
