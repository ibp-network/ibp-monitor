import { ProviderServiceEntity } from '../../domain/provider-service.entity.js'
import { WsProvider } from '@polkadot/api'
import { setDNS, clearDNS } from './dns.js'

export class ProviderConnectionStrategy {
  /** @type {ProviderServiceEntity} */ providerService

  /**
   * @param {ProviderServiceEntity} providerService
   */
  constructor(providerService) {
    this.providerService = providerService
  }

  /**
   * Retrieves the endpoint for the connection
   * @returns {string}
   */
  getEndpoint() {
    throw new Error('Not implemented')
  }

  /**
   * This method runs the necessary steps to happen
   * before initializing the provider connection
   */
  async before() {}

  /**
   * This method builds and retrieves the provider, ready to
   * attempt a connection.
   * @returns {WsProvider} A Polkadot websockets provider
   */
  buildProvider() {
    return new WsProvider(this.getEndpoint(), false, {}, 10 * 1000)
  }

  /**
   * This method runs the necessary steps to happen
   * after disconnecting the provider connection
   */
  async after() {}
}

export class ServiceUrlProviderStrategy extends ProviderConnectionStrategy {
  getEndpoint() {
    return this.providerService.serviceUrl
  }
}

export class MembershipSubdomainProviderStrategy extends ProviderConnectionStrategy {
  /** @type {string} */ #domain
  /** @type {string} */ #subdomain

  constructor(providerService, subdomain) {
    super(providerService)
    this.#domain = `${subdomain}.dotters.network`
  }

  async before() {
    await setDNS(this.#domain, this.providerService.provider.member.serviceIpAddress)
  }

  getEndpoint() {
    return `wss://${this.#domain}/${this.providerService.service.chainId}`
  }

  async after() {
    await clearDNS(this.#domain, this.providerService.provider.member.serviceIpAddress)
  }
}
