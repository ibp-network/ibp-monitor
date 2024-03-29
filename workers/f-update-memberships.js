import axios from 'axios'
import { DataStore } from '../data/data-store.js'
import config from '../config/index.js'
import { ProvidersAggregateRoot } from '../domain/providers.aggregate.js'
import { ServiceEntity } from '../domain/service.entity.js'
import { Logger } from '../lib/utils.js'

const logger = new Logger('worker:updateMemberships')

/**
 * Intializes {@link DataStore} and injects it to the process
 * @param {(ds: DataStore) => Promise<void>} callback
 */
async function withDatastore(callback) {
  await callback(
    new DataStore({
      pruning: config.pruning,
    })
  )
}

/**
 * Fetches the lists of members contained on some config JSON files and updates those lists
 */
export async function updateMemberships() {
  await withDatastore(async (ds) => {
    logger.log('Starting update of memberships list')

    try {
      const { data: membersList } = await axios.get(config.providers.members)
      const { data: externalsList } = await axios.get(config.providers.external)

      const services = (await ds.Service.findAll({ where: { type: 'rpc' } })).map(
        (service) => new ServiceEntity(service)
      )
      const providers = ProvidersAggregateRoot.fromConfig(
        {
          ...membersList.members,
          ...externalsList.providers,
        },
        services
      )

      await providers.providers.reduce(async (thenable, provider) => {
        await thenable

        await ds.Provider.upsert(provider.toRecord())
        if (provider.member) {
          await ds.Member.upsert(provider.member.toRecord())
        }
      }, Promise.resolve())

      await providers.providerServices.reduce(async (thenable, providerService) => {
        await thenable
        await ds.ProviderService.upsert(providerService.toRecord())
      }, Promise.resolve())

      // TODO: Include a check to deactivate services for providers that weren't upserted.
      // Check with @dcolley
    } catch (err) {
      logger.error(`updateMemberships`, err)
    } finally {
      logger.log('Finished process')
    }
  })
}
