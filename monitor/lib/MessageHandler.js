import { DataStore } from './DataStore.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { HealthChecker } from './HealthChecker.js'

class MessageHandler {

  _ds = undefined //= new DataStore({ initialiseDb: true })
  api = undefined

  constructor(config) {
    // console.log('MessageHandler()', config)
    this._ds = config?.datastore || new DataStore({ initialiseDb: true })
    this.api = config.api || new HealthChecker()
    // this._ds = new DataStore({ initialiseDb: true })
    // console.log('MessageHandler()', this._ds)
  }

  // libp2p.addEventListener('peer:discovery', (peerId) => {})
  async handleDiscovery (peerId) {
    // const example = {"isTrusted":false,"detail":{"id":"12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu","multiaddrs":["/ip4/127.0.0.1/tcp/30000","/ip4/192.168.1.91/tcp/30000","/ip4/192.168.1.80/tcp/30000","/ip4/10.62.0.1/tcp/30000","/ip4/172.17.0.1/tcp/30000"],"protocols":[]}}
    console.debug('peer:discovery ', peerId.detail.id.toString())
    console.debug(JSON.stringify(peerId.detail.multiaddrs))
    try {
      const model = { monitorId: peerId.detail.id.toString(), multiaddrs: peerId.detail.multiaddrs }
      const [monitorModel, created] = await this._ds.Monitor.upsert(model)
      // this._ds.upsert('Monitor', { monitorId: peerId.detail.id.toString() }, {multiaddrs: peerId.detail.multiaddrs })
    } catch (err) {
      console.warn('Error trying to upsert discovered monitor', peerId.detail.id.toString())
      console.error(err)
    }
    // console.debug('upsert', created, peerModel)
  }

  /**
   * event: {
   *  signed:
   *  from: Ed25519PeerId
   *  data: Uint8Array(246)
   *  sequenceNumber: number (BigInt?)
   *  topic: string
   *  signature: Uint8Array(64)
   *  key: Uint8Array(32)
   * }
   * @param {} evt 
   */
  async handleMessage (evt) {
    // console.log(evt.detail)
    // if (peerId != self.peerId) {}
    var model
    const record = JSON.parse(uint8ArrayToString(evt.detail.data))
    const monitorId = evt.detail.from.toString()

    switch (evt.detail.topic) {

      // a peer has published their services
      case '/ibp/services':
        const services = record // JSON.parse(uint8ArrayToString(evt.detail.data)) || []
        console.debug('/ibp/services from', monitorId) //, services)
        // `touch` the monitor model
        let [monitor, _] = await this._ds.Monitor.upsert({ monitorId })
        // let [monitor, _] = this._ds.upsert('Monitor', { monitorId, services: serviceUrl })
        services.forEach(async (service) => {
          await this._ds.Service.upsert(service)
          // this._ds.upsert('Service', service)
        })
        const serviceUrls = services.map(s => s.serviceUrl)
        await monitor.addServices(serviceUrls)      
        break

      // a peer has published some results
      case '/ibp/healthCheck':        
        const { serviceUrl, peerId } = record
        // console.log('got healthcheck from ', evt.detail.from.toString(), record)
        // touch the peerId behind the service Url
        console.debug('upserting service:', serviceUrl)
        await this._ds.Service.upsert({ serviceUrl })
        // this._ds.upsert('Service', { serviceUrl })
        console.debug('upserting peer:', peerId, serviceUrl)
        await this._ds.Peer.upsert({ peerId, serviceUrl }) // Peer depends on Service
        // this._ds.upsert('Peer', { peerId, serviceUrl }) // Peer depends on Service
        // console.debug('upserting monitor:', monitorId)
        await this._ds.Monitor.upsert({ monitorId })
        // this._ds.upsert('Monitor', { monitorId })
        model = {
          ...record,
          monitorId,
          // serviceUrl: record.serviceUrl,
          // level: record.level || 'info',
          source: 'gossip'
          // record
        }
        // console.log('model for update', model)
        console.log('/ibp/healthCheck from', monitorId, 'for', serviceUrl, peerId)
        // console.log('handleMessage: /ibp/healthCheck', model)
        // await this._ds.insertHealthCheck(evt.detail.from.toString(), model)
        const created = await this._ds.HealthCheck.create(model)
        // const created = this._ds.HealthCheck.create(model)
        // console.log('created', created)
        break

      default:
        console.log(`received: ${uint8ArrayToString(evt.detail.data)} from ${evt.detail.from.toString()} on topic ${evt.detail.topic}`)
    }
  }

  // publish services we have
  async publishServices (services = [], libp2p) {
    for (var i = 0; i < services.length; i++) {
      const service = services[i]
      // try {
      //   service.serviceId = await this.api.getServiceId(service.url)
      // } catch (err) {
      //   console.warn('Error getting serviceId for', service.url)
      //   console.error(err)
      // }
      // console.debug('result', results[0])
      const res = await libp2p.pubsub.publish('/ibp/services', uint8ArrayFromString(JSON.stringify([service])))
      // console.debug(res)
    }
  }

  // publish the results of our healthChecks
  async publishResults (results = []) {
    console.debug('Publishing our healthChecks')
    libp2p.getPeers().forEach(async (peerId) => {
      console.log('our peers are:', peerId.toString())
      const peer = await ds.Peer.findByPk( peerId.toString(), { include: 'services' })
      // console.debug('peer', peer)
      const results = await hc.check(peer.services) || []
      console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
        // console.debug('sent message to peer', res?.toString())
      })
    }) // === end of peers update cycle ===

    // check our own services?
    if (config.checkOwnServices) {
      console.debug('checking our own services...')
      const results = await hc.check(config.services) || []
      console.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)))
      })
    }
  } // end of publishResults()

}

export {
  MessageHandler
}
