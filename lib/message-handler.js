import { DataStore } from '../data/data-store.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
// import { HealthChecker } from './health-checker.js'
import { pipe } from 'it-pipe'
import { stringToStream, shortStash } from './utils.js'
import { Logger } from './utils.js'

const logger = new Logger('utils:messageHandler')

class MessageHandler {
  /** @type {DataStore} */ _ds = undefined

  constructor(config) {
    this._ds = config?.datastore || new DataStore({})
  }

  async handleDiscovery(peer) {
    logger.debug('peer:discovery ', peer.detail.id.toString())

    // monitors will be upserted when they publish to /ibp/service
    // from 2022.12.14 we have browser connections, do not add them as monitors (yet...)
    if (peer.detail && peer.detail.id && peer.detail.multiaddrs) {
      await this._ds.Monitor.upsert({
        id: peer.detail.id.toString(),
        multiaddress: peer.detail.multiaddrs,
      })
    }
  }

  async handleProtocol({ connection, stream, protocol }) {
    logger.debug('handleProtocol', protocol) // , stream, connection)
    switch (protocol) {
      case '/ibp/ping':
        try {
          // receive the message
          logger.info(`message from ${connection.remotePeer.toString()}`)
          var weGot = ''
          await pipe(stream, async function (source) {
            for await (const message of source) {
              logger.info(`->: ${message.toString()}`)
              weGot = weGot + message
            }
          })
          // Replies are done on new streams, so let's close this stream so we don't leak it
          // respond with 'pong'
          const response = stringToStream('pong:' + weGot)
          await pipe(response, stream)
        } catch (err) {
          logger.error(err)
        }
        break
      case '/ipfs/ping/1.0.0':
      case '/ipfs/id/push/1.0.0':
      case '/libp2p/circuit/relay/0.1.0':
      case '/ibp/prom-data':
        break
      default:
        return
    }
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
  async handleMessage(evt) {
    // logger.log(evt.detail)
    // if (peerId != self.peerId) {}
    var model
    const record = JSON.parse(uint8ArrayToString(evt.detail.data))
    const monitorId = evt.detail.from.toString()

    switch (evt.detail.topic) {
      // a peer has published their services
      case '/ibp/services':
        logger.log('/ibp/services deprecated')
        // const services = record // JSON.parse(uint8ArrayToString(evt.detail.data)) || []
        // logger.debug('/ibp/services from', monitorId) //, services)
        // // `touch` the monitor model
        // let [monitor, _] = await this._ds.Monitor.upsert({ monitorId })
        // // let [monitor, _] = this._ds.upsert('Monitor', { monitorId, services: serviceUrl })
        // services.forEach(async (service) => {
        //   await this._ds.Service.upsert(service)
        //   // this._ds.upsert('Service', service)
        // })
        // var servicesToAdd = services.map(s => s.serviceUrl)
        // // logger.debug('servicesToAdd', servicesToAdd)
        // var servicesToRemove = await monitor.getServices({ where: { serviceUrl: { [Op.notIn]: servicesToAdd } } })
        // servicesToRemove = servicesToRemove.map(m => m.serviceUrl)
        // // logger.debug('servicesToRemove', servicesToRemove)
        // await monitor.removeServices(servicesToRemove)
        // await monitor.addServices(servicesToAdd)
        break

      // a peer has published some results
      case '/ibp/healthCheck':
        const { providerId = record.memberId, serviceId, peerId } = record
        model = {
          ...record,
          monitorId,
          providerId,
          // serviceUrl: record.serviceUrl,
          // level: record.level || 'info',

          // This will help solve the migration process, since previous to this version,
          // all checks come from members' provided services
          source: 'gossip',
          // record
        }
        // make sure the monitor exists - it's possible to get a healthCheck before a monitor publishes its peerId
        const monitor = await this._ds.Monitor.findByPk(monitorId)
        if (!monitor)
          await this._ds.Monitor.create({ id: monitorId, multiaddress: [], status: 'active' })

        // logger.log('model for update', model)
        logger.log(
          '/ibp/healthCheck from',
          shortStash(monitorId),
          'for',
          providerId,
          serviceId,
          peerId
        )
        const providerServiceNode = await this._ds.ProviderServiceNode.findByPk(peerId)
        if (!providerServiceNode) {
          const providerService = await this._ds.ProviderService.findOne({
            where: { providerId, serviceId },
          })
          if (providerService) {
            if (!peerId) {
              logger.log('New provider service node has null stash. Ignore.')
            } else {
              logger.log('New provider service node:', providerId, serviceId, peerId)
              let node = {
                peerId,
                serviceId,
                providerId,
              }
              await this._ds.ProviderServiceNode.create(node)
            }
          } else {
            logger.error('Provider service not found:', providerId, serviceId)
            break
          }
        }
        const hc = await this._ds.HealthCheck.create(model)
        logger.log(`Created health check ${hc.id} for`, providerId, serviceId, shortStash(peerId))
        break
      case '/ibp/rpc':
        break
      default:
        logger.log(
          `received: ${uint8ArrayToString(
            evt.detail.data
          )} from ${evt.detail.from.toString()} on topic ${evt.detail.topic}`
        )
    }
  }

  // publish services we have
  async publishServices(services = [], libp2p) {
    for (var i = 0; i < services.length; i++) {
      const service = services[i]
      // try {
      //   service.serviceId = await this._api.getServiceId(service.url)
      // } catch (err) {
      //   logger.warn('Error getting serviceId for', service.url)
      //   logger.error(err)
      // }
      // logger.debug('result', results[0])
      const res = await libp2p.pubsub.publish(
        '/ibp/services',
        uint8ArrayFromString(JSON.stringify([service]))
      )
      // logger.debug(res)
    }
  }

  // publish the results of our healthChecks
  async publishResults(results = []) {
    logger.debug('Publishing our healthChecks')
    libp2p.getPeers().forEach(async (peerId) => {
      logger.log('our peers are:', peerId.toString())
      const peer = await ds.Peer.findByPk(peerId.toString(), { include: 'services' })
      // logger.debug('peer', peer)
      const results = (await hc.check(peer.services)) || []
      logger.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish(
          '/ibp/healthCheck',
          uint8ArrayFromString(JSON.stringify(result))
        )
        // logger.debug('sent message to peer', res?.toString())
      })
    }) // === end of peers update cycle ===

    // check our own services?
    if (config.checkOwnServices) {
      logger.debug('checking our own services...')
      const results = (await hc.check(config.services)) || []
      logger.debug(`publishing healthCheck: ${results.length} results to /ibp/healthCheck`)
      asyncForeach(results, async (result) => {
        const res = await libp2p.pubsub.publish(
          '/ibp/healthCheck',
          uint8ArrayFromString(JSON.stringify(result))
        )
      })
    }
  } // end of publishResults()
}

export { MessageHandler }
