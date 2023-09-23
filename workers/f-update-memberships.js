import axios from 'axios'
import { DataStore } from '../data/data-store.js'
import config from '../config/index.js'
import { ProvidersAggregateRoot } from '../domain/providers.aggregate.js'
import { ServiceEntity } from '../domain/service.entity.js'
import * as url from 'node:url'

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
    console.log('[worker] updateMemberships: Starting update of memberships list')

    try {
      const { data: membersList } = await axios.get(config.providers.members)
      const { data: externalsList } = await axios.get(config.providers.external)

      const services = (await ds.Service.findAll({ where: { type: 'rpc' } })).map(
        (service) => new ServiceEntity(service)
      )
      const providers = ProvidersAggregateRoot.fromConfig(
        {
          ...membersList.members,
          ...externalsList.members,
        },
        services
      )

      await providers.members.reduce(async (thenable, member) => {
        await thenable
        return ds.Member.upsert(member.toRecord())
      }, Promise.resolve())

      await providers.providedServices.reduce(async (thenable, memberService) => {
        await thenable
        return ds.MemberService.upsert(memberService.toRecord())
      }, Promise.resolve())

      // TODO: Include a check to deactivate services for providers that weren't upserted.
      // Check with @dcolley
    } catch (err) {
      console.error(`[worker] updateMemberships`, err)
    } finally {
      console.log('[worker] updateMemberships: Finished process')
    }
  })
}
