import moment from 'moment'
import { DataTypes, Op, Sequelize, Model } from 'sequelize'

import { chainModel } from '../data/models/chain.js'
import { memberModel } from '../data/models/member.js'
import { membershipLevelModel } from '../data/models/membership-level.js'
import { serviceModel } from '../data/models/service.js'
import { providerModel } from '../data/models/provider.js'
import { providerServiceModel } from '../data/models/provider-service.js'
import { providerServiceNodeModel } from '../data/models/provider-service-node.js'
import { monitorModel } from '../data/models/monitor.js'
import { healthCheckModel } from '../data/models/health-check.js'
import { geoDnsPoolModel } from '../data/models/geo-dns-pool.js'

import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'
const cfg = Object.assign(config, configLocal)

const sequelize = new Sequelize(
  cfg.sequelize.database,
  cfg.sequelize.username,
  cfg.sequelize.password,
  cfg.sequelize.options
)

class DataStore {
  /** @type {import('sequelize').ModelStatic<Model<typeof chainModel.definition>>} */
  Chain = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof geoDnsPoolModel.definition>>} */
  GeoDnsPool = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof healthCheckModel.definition>>} */
  HealthCheck = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof memberModel.definition>>} */
  Member = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof membershipLevelModel.definition>>} */
  MembershipLevel = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof providerModel.definition>>} */
  Provider = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof providerServiceModel.definition>>} */
  ProviderService = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof providerServiceNodeModel.definition>>} */
  ProviderServiceNode = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof serviceModel.definition>>} */
  Service = undefined
  /** @type {import('sequelize').ModelStatic<Model<typeof monitorModel.definition>>} */
  Monitor = undefined

  pruning = {
    age: 90 * (24 * 60 * 60), // days as seconds
    interval: 1 * (24 * 60 * 60), // 1 day as seconds
  }

  constructor(config = {}) {
    console.debug('DataStore()', config)

    this.pruning = Object.assign(this.pruning, config.pruning)
    // define chain
    const Chain = sequelize.define(chainModel.options.tableName, chainModel.definition, {
      ...chainModel.options,
      sequelize,
    })
    Chain.hasMany(Chain, {
      foreignKey: 'relayChainId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    Chain.belongsTo(Chain, {
      foreignKey: 'relayChainId',
    })

    // define membership level
    const MembershipLevel = sequelize.define(
      membershipLevelModel.options.tableName,
      membershipLevelModel.definition,
      {
        ...membershipLevelModel.options,
        sequelize,
      }
    )

    // define provider
    const Provider = sequelize.define(providerModel.options.tableName, providerModel.definition, {
      ...providerModel.options,
      sequelize,
    })

    // define member
    const Member = sequelize.define(memberModel.options.tableName, memberModel.definition, {
      ...memberModel.options,
      sequelize,
    })
    MembershipLevel.hasMany(Member, {
      as: 'members',
      foreignKey: 'membershipLevelId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    Member.belongsTo(MembershipLevel, {
      as: 'membershipLevel',
      foreignKey: 'membershipLevelId',
    })

    Member.belongsTo(Provider, {
      as: 'provider',
      foreignKey: 'providerId',
    })
    Provider.hasOne(Member, {
      as: 'member',
      foreignKey: 'providerId',
    })

    // define service
    const Service = sequelize.define(serviceModel.options.tableName, serviceModel.definition, {
      ...serviceModel.options,
      sequelize,
    })
    Chain.hasMany(Service, {
      as: 'services',
      foreignKey: 'chainId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    Service.belongsTo(Chain, {
      as: 'chain',
      foreignKey: 'chainId',
    })
    MembershipLevel.hasMany(Service, {
      as: 'services',
      foreignKey: 'membershipLevelId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    Service.belongsTo(MembershipLevel, {
      as: 'membershipLevel',
      foreignKey: 'membershipLevelId',
    })

    // define member service
    const ProviderService = sequelize.define(
      providerServiceModel.options.tableName,
      providerServiceModel.definition,
      {
        ...providerServiceModel.options,
        sequelize,
      }
    )
    Provider.hasMany(ProviderService, {
      as: 'services',
      foreignKey: 'providerId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    ProviderService.belongsTo(Provider, {
      as: 'provider',
      foreignKey: 'providerId',
    })

    // define member service node
    const ProviderServiceNode = sequelize.define(
      providerServiceModel.options.tableName,
      providerServiceNodeModel.definition,
      {
        ...providerServiceNodeModel.options,
        sequelize,
      }
    )
    Service.hasMany(ProviderServiceNode, {
      as: 'nodes',
      foreignKey: 'serviceId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    ProviderServiceNode.belongsTo(Service, {
      as: 'service',
      foreignKey: 'serviceId',
    })
    Provider.hasMany(ProviderServiceNode, {
      as: 'nodes',
      foreignKey: 'providerId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    ProviderServiceNode.belongsTo(Provider, {
      as: 'provider',
      foreignKey: 'providerId',
    })
    // This is a hack to get around the fact that sequelize does not support composite foreign keys
    ProviderService.hasMany(ProviderServiceNode, {
      as: 'providerNodes',
      foreignKey: 'providerId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    ProviderService.hasMany(ProviderServiceNode, {
      as: 'serviceNodes',
      foreignKey: 'serviceId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })

    // define monitor
    const Monitor = sequelize.define(monitorModel.options.name, monitorModel.definition, {
      ...monitorModel.options,
      sequelize,
    })

    // define health check
    const HealthCheck = sequelize.define('health_check', healthCheckModel.definition, {
      ...healthCheckModel.options,
      sequelize,
    })
    Monitor.hasMany(HealthCheck, {
      as: 'healthChecks',
      foreignKey: 'monitorId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    HealthCheck.belongsTo(Monitor, {
      as: 'monitor',
      foreignKey: 'monitorId',
    })
    Service.hasMany(HealthCheck, {
      as: 'healthChecks',
      foreignKey: 'serviceId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    HealthCheck.belongsTo(Service, {
      as: 'service',
      foreignKey: 'serviceId',
    })
    Provider.hasMany(HealthCheck, {
      as: 'healthChecks',
      foreignKey: 'providerId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    HealthCheck.belongsTo(Provider, {
      as: 'provider',
      foreignKey: 'providerId',
    })

    Member.hasMany(HealthCheck, {
      as: 'healthChecks',
      foreignKey: 'memberId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    HealthCheck.belongsTo(Member, {
      as: 'member',
      foreignKey: 'memberId',
    })
    ProviderServiceNode.hasMany(HealthCheck, {
      as: 'healthChecks',
      foreignKey: 'peerId',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    })
    HealthCheck.belongsTo(ProviderServiceNode, {
      as: 'node',
      foreignKey: 'peerId',
    })

    const GeoDnsPool = sequelize.define('geo_dns_pool', geoDnsPoolModel.definition, {
      ...geoDnsPoolModel.options,
      sequelize,
    })

    this.Chain = Chain
    this.GeoDnsPool = GeoDnsPool
    this.HealthCheck = HealthCheck
    this.Member = Member
    this.MembershipLevel = MembershipLevel
    this.Provider = Provider
    this.ProviderService = ProviderService
    this.ProviderServiceNode = ProviderServiceNode
    this.Monitor = Monitor
    this.Service = Service
  }

  async close() {
    console.debug('Closing datastore...')
    return await sequelize.close()
  }

  async prune() {
    console.debug('DataStore.prune()', this.pruning)
    const marker = moment.utc().add(-this.pruning.age, 'seconds')
    console.debug('marker', marker)
    var result
    result = await this.HealthCheck.destroy({
      where: { createdAt: { [Op.lt]: marker.format('YYYY-MM-DD HH:mm:ss') } },
    })
    console.debug('HealthCheck.prune: delete', result)
    // result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, errorCount: { [Op.gt]: 10 } } })
    // console.debug('Service.stale: error', result)
    // result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, updatedAt: { [Op.lt]: marker } } })
    // console.debug('Service.stale: updatedAt', result)
    // delete healthChecks for stale services
    // const staleServices = this.Service.findAll({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    // for(var i = 0; i < staleServices.length; i++) {
    //   const svc = staleServices[i]
    //   await this.HealthCheck.destroy({ where: { serviceUrl: svc.serviceUrl } })
    // }
    // result = await this.HealthCheck.destroy({ where: })
    // delete stale services
    // result = await this.Service.destroy({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    // console.debug('Services.prune: stale', result)
    // TODO prune stale monitors
  }
}

export { DataStore }
