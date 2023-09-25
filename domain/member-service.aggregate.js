import { MemberEntity } from './member.entity.js'
import { ServiceEntity } from './service.entity.js'

/**
 * Represents an entrypoint for a service provided by an entity within the network,
 * either a member or a non-member
 */
export class MemberServiceAggregate {
  /** @type {MemberEntity} */ member
  /** @type {ServiceEntity} */ service
  /** @type {String} */ serviceUrl
  /** @type {'active' | 'inactive'} */ status

  constructor({ member, service, serviceUrl, status }) {
    this.member = member
    this.service = service
    this.serviceUrl = serviceUrl
    this.status = status
  }

  /**
   * Receivs a list of services, as well as a config object for the input member and its
   * @param {[string, string]} endpointConfig The config object that defines a member
   * @param {ServiceEntity[]} services A list of all the available services
   * @param {MemberEntity} member The member for which this endpoint belongs to
   * @returns {MemberServiceAggregate} An member service descriptor based on the endpoint information
   */
  static fromConfig([chainId, serviceUrl], services, member) {
    const service = services.find((service) => service.chainId === chainId)

    return new MemberServiceAggregate({
      member,
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
      memberId: this.member.id,
      serviceId: this.service.id,
      serviceUrl: this.serviceUrl,
      status: this.status,
    }
  }
}
