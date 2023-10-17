import { ServiceEntity } from './service.entity.js'
import { ProviderEntity } from './provider.entity.js'
import { ProviderServiceEntity } from './provider-service.entity.js'

export class ProvidersAggregateRoot {
  /** @type {ProviderEntity[]}} */ providers = []
  /** @type {ProviderServiceEntity[]}} */ providerServices = []

  /**
   * Takes a providers list from a config object and retrieves a list of aggregate {@link ProviderServiceEntity}s
   * @param {Record<string, Object>} config
   * @param {ServiceEntity[]} services
   */
  static fromConfig(config, services) {
    let root = new ProvidersAggregateRoot()

    Object.entries(config).forEach(([id, providerConfig]) => {
      const provider = ProviderEntity.fromConfig(
        { id, ...providerConfig },
        'membership' in providerConfig
      )

      Object.entries(providerConfig.endpoints || {}).forEach((endpointConfig) => {
        root.providerServices.push(
          ProviderServiceEntity.fromConfig(endpointConfig, services, provider)
        )
      })

      root.providers.push(provider)
    })

    return root
  }

  /**
   * Creates an aggregate based on the
   * @param {ProviderEntity[]} providers
   * @param {ServiceEntity[]} services
   * @param {{ providerId: string, serviceId: string, serviceUrl: string, status: string }[]} providerServices
   */
  static fromDataStore(providers, services, providerServices, filter = () => true) {
    const root = new ProvidersAggregateRoot()

    root.providers = providers
    root.providerServices = providerServices
      .map((providerService) => {
        return new ProviderServiceEntity({
          provider: providers.find((provider) => provider.id === providerService.providerId),
          service: services.find((service) => service.id === providerService.serviceId),
          serviceUrl: providerService.serviceUrl,
          status: providerService.status,
        })
      })
      .filter(filter)

    return root
  }

  /**
   * Creates an providers aggregate root based on the mere cross product of the providers and services lists
   * @param {ProviderEntity[]} providers
   * @param {ServiceEntity[]} services
   * @param {(provider: ProviderServiceEntity) => bool} filter
   */
  static crossProduct(providers, services, filter = () => true) {
    const root = new ProvidersAggregateRoot()

    root.providers = providers
    root.providerServices = providers.flatMap((provider) => {
      return services
        .map((service) => {
          return new ProviderServiceEntity({
            provider,
            service,
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
    const root = new ProvidersAggregateRoot()

    return [this, ...other].reduce((prev, other) => {
      prev.providers = Array.from(new Set(prev.providers.concat(other.providers)))
      prev.providerServices = Array.from(
        new Set(prev.providerServices.concat(other.providerServices))
      )

      return prev
    }, root)
  }
}
