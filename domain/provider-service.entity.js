import { ProviderEntity } from './provider.entity.js'
import { ServiceEntity } from './service.entity.js'

/**
 * Represents an entrypoint for a service provided by an entity within the network,
 * either a member or a non-member
 */
export class ProviderServiceEntity {
  /** @type {ProviderEntity} */ provider
  /** @type {ServiceEntity} */ service
  /** @type {String} */ serviceUrl
  /** @type {'active' | 'inactive'} */ status

  constructor({ provider, service, serviceUrl, status }) {
    this.provider = provider
    this.service = service
    this.serviceUrl = serviceUrl
    this.status = status
  }

  /**
   * Receivs a list of services, as well as a config object for the input member and its
   * @param {[string, string]} endpointConfig The config object that defines a member
   * @param {ServiceEntity[]} services A list of all the available services
   * @param {ProviderEntity} provider The member for which this endpoint belongs to
   * @returns {ProviderServiceEntity} An member service descriptor based on the endpoint information
   */
  static fromConfig([chainId, serviceUrl], services, provider) {
    const service = services.find((service) => service.chainId === chainId)

    return new ProviderServiceEntity({
      provider,
      service,
      serviceUrl,
      status: 'active',
    })
  }

  /**
   * Transforms the aggregate into a database-friendly version
   * @returns A database-modelled version of the object
   */
  toRecord() {
    return {
      providerId: this.provider.id,
      serviceId: this.service.id,
      serviceUrl: this.serviceUrl,
      status: this.status,
    }
  }
}
