import { ApiError, ProviderError } from './errors.js'
import { ApiPromise, WsProvider } from '@polkadot/api'
import {
  MembershipSubdomainProviderStrategy,
  ProviderConnectionStrategy,
  ServiceUrlProviderStrategy,
} from './provider-connection-strategy.js'
import { tryConnectApi, tryConnectProvider } from './try-connect.js'

import { HealthCheckEntity } from '../../domain/health-check.entity.js'
import { Logger } from '../utils.js'
import { ProviderServiceEntity } from '../../domain/provider-service.entity.js'

const logger = new Logger('lib:checkService:HealthChecker')

class HealthChecker {
  /** @type {string} */ #monitorId
  /** @type {ProviderServiceEntity} */ #providerService
  /** @type {string?} */ #peerId
  /** @type {ProviderConnectionStrategy} */ #connectionStrategy

  /**
   * Initializes an instance of the {@link HealthChecker} service
   * @param {Object} config An object with the configuration of the service
   * @param {string} config.monitorId The monitorId
   * @param {string?} config.peerId A representation of a peerId, if given
   * @param {ProviderServiceEntity} config.providerService The provider that will be checked
   */
  constructor({ monitorId, providerService, peerId }) {
    this.#monitorId = monitorId
    this.#providerService = providerService
    this.#peerId = peerId

    this.#connectionStrategy = ((providerService) => {
      if (providerService.provider.member) {
        return new MembershipSubdomainProviderStrategy(
          providerService,
          providerService.service.membershipLevel.subdomain
        )
      } else {
        return new ServiceUrlProviderStrategy(providerService)
      }
    })(this.#providerService)
  }

  /**
   * Creates a {@link WsProvider} associated to the {@link ProviderServiceEntity}
   * Then, retrieves it.
   * @returns {Promise<WsProvider>} The connected instance of the provider
   */
  buildProvider() {
    return this.#connectionStrategy.buildProvider()
  }

  /**
   * Attempts connecting to a given {@link WsProvider}.
   * @param {WsProvider} provider The provider to attempt connection to
   * @throws {ProviderError} In case the connection to the {@link WsProvider} fails
   */
  async connectProvider(provider) {
    try {
      await this.#connectionStrategy.before()

      logger.log('connecting to the provider...')
      await tryConnectProvider(provider)
      logger.log('provider connected!')

      logger.log('checking if provider is ready...')
      await provider.isReady
      logger.log('provider is ready!')

      return provider
    } catch (err) {
      logger.error('Error', err)
      throw new ProviderError(err)
    }
  }

  get connectionStrategy() {
    return this.#connectionStrategy
  }

  /**
   * Builds and retrieves an API.
   * @param {WsProvider} wsProvider The connected Websockets provider
   * @returns {Promise<ApiPromise>} The instance of the exposed API
   */
  buildApi(provider) {
    return ApiPromise.create({ provider, noInitWarn: true, throwOnConnect: true })
  }

  /**
   * Attempts connecting to the API
   * @param {ApiPromise} api The API to attempt connecting into
   * @returns {Promise<ApiPromise>} The instance of the exposed API
   * @throws {ApiError} In case the connection to the API fails
   */
  async connectApi(api) {
    return tryConnectApi(api, logger)
  }

  /**
   * This method will attempt retrieving the statistics that will conform
   * the health check for the given {@link ProviderServiceEntity}
   * @param {ApiPromise} api The connected API to fetch the stats from
   * @param {number} expectedQueryTime The maximum expected querying time, given by SLA settings
   * @returns {HealthCheckEntity}
   */
  async tryCheck(api, expectedQueryTime = 500) {
    const monitorId = this.#monitorId
    const { service, provider, serviceUrl } = this.#providerService

    const serviceId = service.id
    const providerId = provider.id
    const memberId = provider?.member?.id

    const peerId = await api.rpc.system.localPeerId()
    const chain = await api.rpc.system.chain()
    const chainType = await api.rpc.system.chainType()

    // start
    var start = performance.now()
    const health = await api.rpc.system.health()
    var end = performance.now()
    // end timer

    const networkState = api.rpc.system.networkState // () // not a function?
    const syncState = await api.rpc.system.syncState()
    const finalizedBlockHash = await api.rpc.chain.getFinalizedHead()
    const { number: finalizedBlock } = await api.rpc.chain.getHeader(finalizedBlockHash)
    // const blockDrift = syncState.currentBlock.toNumber() - finalizedBlock
    const version = await api.rpc.system.version()
    const timing = end - start

    return new HealthCheckEntity({
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId,
      serviceId,
      providerId,
      memberId,

      peerId: peerId.toString(),
      source: 'check',
      type: 'service_check',
      status: timing > expectedQueryTime ? 'warning' : 'success',
      responseTimeMs: timing,

      record: {
        monitorId,
        serviceId,
        providerId,
        memberId,

        endpoint: this.#connectionStrategy.getEndpoint(),
        ipAddress: provider?.member?.serviceIpAddress,

        chain,
        chainType,
        health,
        networkState,
        syncState,
        finalizedBlock,
        version,

        performance: timing,
      },
    })
  }

  /**
   * Retrieves a {@link HealthCheckEntity} that corresponds with a check error
   * @returns {HealthCheckEntity}
   */
  errorCheck() {
    const monitorId = this.#monitorId
    const { service, provider, serviceUrl } = this.#providerService

    const serviceId = service.id
    const providerId = provider.id
    const memberId = provider.member.id

    return new HealthCheckEntity({
      monitorId,
      serviceId,
      providerId,
      memberId,

      peerId: this.#peerId?.toString() || null,

      source: 'check',
      type: 'service_check',
      status: 'error',

      record: {
        monitorId,
        serviceId,
        providerId,
        memberId,
        endpoint: serviceUrl,
      },
    })
  }
}

export { HealthChecker }
