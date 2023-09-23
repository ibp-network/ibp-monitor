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
}
