import { Sequelize } from 'sequelize'
import { Umzug, SequelizeStorage } from 'umzug'
import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'
import { DataStore } from './data-store.js'
import axios from 'axios'

const cfg = Object.assign(config, configLocal)
const ds = new DataStore({ pruning: cfg.pruning })
const sequelize = new Sequelize(
  cfg.sequelize.database,
  cfg.sequelize.username,
  cfg.sequelize.password,
  cfg.sequelize.options
)

async function updateMembers() {
  // get updated members.json
  const membersResponse = await axios.get(
    'https://raw.githubusercontent.com/ibp-network/config/main/members.json'
  )
  if (membersResponse.data) {
    for (const [memberId, data] of Object.entries(membersResponse.data.members)) {
      console.log('Upserting member: ', memberId)
      // member
      const {
        name,
        website,
        logo,
        membership,
        current_level,
        active,
        level_timestamp,
        services_address,
        endpoints,
        region,
        latitude,
        longitude,
        payments,
      } = data
      if (current_level == 0) {
        continue
      }
      const record = {
        id: memberId,
        name,
        websiteUrl: website,
        logoUrl: logo,
        membershipType: membership,
        membershipLevelId: Number(current_level),
        membershipLevelTimestamp: Number(level_timestamp[current_level]),
        status: Number(active) == 1 ? 'active' : 'pending',
        serviceIpAddress: services_address,
        region,
        latitude: Number(latitude),
        longitude: Number(longitude),
      }
      await ds.Member.upsert(record)
      // member endpoints
      if (data.endpoints) {
        for (const [chainId, serviceUrl] of Object.entries(data.endpoints)) {
          const service = await ds.Service.findOne({ where: { chainId, type: 'rpc' } })
          if (service != null) {
            const memberService = {
              memberId,
              serviceId: service.id,
              serviceUrl,
              status: 'active',
            }
            await ds.MemberService.upsert(memberService)
          } else {
            console.log(`WARNING: Service not defined for chainId: ${chainId} and serviceUrl: ${serviceUrl}`);
          }
        }
      }
    }
  }
}

;(async () => {
  const umzug = new Umzug({
    migrations: {
      glob: './migrations/*.js',
      resolve: (params) => {
        if (params.path.endsWith('.mjs') || params.path.endsWith('.js')) {
          const getModule = () => import(`file:///${params.path.replace(/\\/g, '/')}`)
          return {
            name: params.name,
            path: params.path,
            up: async (upParams) => (await getModule()).up(upParams),
            down: async (downParams) => (await getModule()).up(downParams),
          }
        }
        return {
          name: params.name,
          path: params.path,
          ...require(params.path),
        }
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, modelName: 'sequelize_migrations' }),
    logger: console,
  })
  console.log('Running migrations...')
  await umzug.up()
  console.log('Updating members...')
  await updateMembers()
  console.log('Completed.')
})()
