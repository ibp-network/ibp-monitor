import { ServiceEntity } from './service.entity.js'
import { MemberEntity } from './member.entity.js'
import { MemberServiceAggregate } from './member-service.aggregate.js'

export class ProvidersAggregateRoot {
  /** @type {MemberEntity[]}} */ members = []
  /** @type {MemberServiceAggregate[]}} */ providedServices = []

  /**
   * Takes a `members` list from a config object and retrieves a list of aggregate {@link MemberServiceAggregate}s
   * @param {Record<string, Object>} config
   * @param {ServiceEntity[]} services
   */
  static fromConfig(config, services) {
    let root = new ProvidersAggregateRoot()

    Object.entries(config).forEach(([id, memberConfig]) => {
      const member = MemberEntity.fromConfig({ id, ...memberConfig })

      Object.entries(memberConfig.endpoints ?? {}).forEach((endpointConfig) => {
        root.providedServices.push(
          MemberServiceAggregate.fromConfig(endpointConfig, services, member)
        )
      })

      root.members.push(member)
    })

    return root
  }

  /**
   * Creates an aggregate based on the
   * @param {MemberEntity[]} members
   * @param {ServiceEntity[]} services
   * @param {{ memberId: string, serviceId: string, serviceUrl: string, status: string }[]} memberServices
   */
  static fromDataStore(members, services, memberServices, filter = () => true) {
    const root = new ProvidersAggregateRoot()

    root.members = members
    root.providedServices = memberServices
      .map((memberService) => {
        return new MemberServiceAggregate({
          member: members.find((member) => member.id === memberService.memberId),
          service: services.find((service) => service.id === memberService.serviceId),
          serviceUrl: memberService.serviceUrl,
          status: memberService.status,
        })
      })
      .filter(filter)

    return root
  }

  /**
   * Creates an providers aggregate root based on the mere cross product of the members and services lists
   * @param {MemberEntity[]} members
   * @param {ServiceEntity[]} services
   */
  static crossProduct(members, services, filter = () => true) {
    const root = new ProvidersAggregateRoot()

    root.members = members
    root.providedServices = members.flatMap((member) => {
      return services
        .map((service) => {
          return new MemberServiceAggregate({
            member,
            service,
            serviceUrl: service.serviceUrl,
            status: service.status,
          })
        })
        .filter(filter)
    })

    return root
  }

  /**
   * Merges two or more providers' aggregate roots
   * @param {ProvidersAggregateRoot[]} other
   */
  concat(...other) {
    const root = JSON.parse(JSON.stringify(this))

    return other.reduce((root, other) => {
      root.members = Array.from(new Set(prev.mebers.concat(other.members)))
      root.providedServices = Array.from(
        new Set(prev.providedServices.concat(other.providedServices))
      )

      return root
    }, root)
  }
}
