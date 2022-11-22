import { ApiPromise, WsProvider } from '@polkadot/api'
import { asyncForeach } from './utils.js'

class HealthChecker {
  services = []
  constructor(services = [], logger) {
    // TODO customise the logger for debug
    this.services = services
  }

  addService () {}
  deleteService () {}

  async check () {
    var results = []
    await asyncForeach(this.services, async (service) => {
      // TODO different types of service? http / substrate / ...?
      try {
        console.debug('HealthCheck.check()', service.serviceId)
        const provider = new WsProvider(service.url)
        const api = await ApiPromise.create({ provider })
        await api.isReady
        const localPeerId = await api.rpc.system.localPeerId()
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
        results.push({
          peerId: localPeerId.toString(), chain, chainType, health, networkState, syncState, version,
          performance: end - start
        })
        await provider.disconnect()
        console.debug('HealthCheck.check() done')
      } catch (err) {
        console.error(err)
      }
    })
    // console.log(results)
    return results
  }

}

export {
  HealthChecker
}
