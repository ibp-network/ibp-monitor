import { ApiPromise, WsProvider } from '@polkadot/api'
import { asyncForeach } from './utils.js'

class HealthChecker {
  services = []
  constructor(services = []) {
    this.services = services
  }

  addService () {}
  deleteService () {}

  async check () {
    var results = []
    await asyncForeach(this.services, async (service) => {
      try {
        const provider = new WsProvider(service.url)
        const api = await ApiPromise.create({ provider })
        const localPeerId = await api.rpc.system.localPeerId()
        // console.log('localPeerId', localPeerId.toString())
        const health = await api.rpc.system.health()
        const networkState = await api.rpc.system.networkState
        const syncState = await api.rpc.system.syncState()
        const version = await api.rpc.system.version()
        // console.debug(health.toString())
        results.push({ peerId: localPeerId.toString(), health, networkState, syncState, version })
        await provider.disconnect()
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
