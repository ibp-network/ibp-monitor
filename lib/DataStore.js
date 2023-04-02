
import moment from 'moment'
import { Op, Sequelize } from 'sequelize'

import { monitorModel } from '../models/monitor.js'
import { memberModel } from '../models/member.js'
import { serviceModel } from '../models/service.js'
import { peerModel } from '../models/peer.js'
import { healthCheckModel } from '../models/healthCheck.js'
import { logModel } from '../models/log.js'

import { config } from '../config/config.js'
import { configLocal } from '../config/config.local.js'
const cfg = Object.assign(config, configLocal)

const sequelize = new Sequelize(cfg.sequelize.database, cfg.sequelize.username, cfg.sequelize.password, cfg.sequelize.options)

class DataStore {
  Service = undefined
  Peer = undefined
  Member = undefined
  HealthCheck = undefined
  Log = undefined
  pruning = {
    age: 90 * 24 * 60 * 60, // days as seconds
    interval: 1 * 24 * 60 * 60 // 1 day as seconds
  }

  constructor(config = {}) {
    console.debug('DataStore()', config)
    this.pruning = Object.assign(this.pruning, config.pruning)
    const Member = sequelize.define('member', memberModel.definition, { ...memberModel.options, sequelize })
    const Service = sequelize.define('service', serviceModel.definition, { ...serviceModel.options, sequelize })
    const Peer = sequelize.define('peer', peerModel.definition, { ...peerModel.options, sequelize })
    const Monitor = sequelize.define('monitor', monitorModel.definition, { ...monitorModel.options, sequelize })
    const HealthCheck = sequelize.define('health_check', healthCheckModel.definition, { ...healthCheckModel.options, sequelize })
    const Log = sequelize.define('log', logModel.definition, { ...logModel.options, sequelize })

    Member.hasMany(Service, { as: 'services', foreignKey: 'memberId' })

    Service.belongsTo(Member, { foreignKey: 'memberId' })
    Service.hasMany(Peer, { as: 'peers', foreignKey: 'serviceUrl' })
    Service.belongsToMany(Monitor, { as: 'monitors', through: 'monitor_service', foreignKey: 'serviceUrl', otherKey: 'monitorId' })
    Service.hasMany(HealthCheck, { as: 'healthChecks', foreignKey: 'serviceUrl' })
    Service.hasMany(Log, { foreignKey: 'serviceUrl' })
    
    Peer.belongsTo(Service, { foreignKey: 'serviceUrl' })
    Peer.hasMany(HealthCheck, { as: 'healthChecks', foreignKey: 'peerId' })
    Peer.hasMany(Log, { foreignKey: 'peerId' })

    Monitor.belongsToMany(Service, { as: 'services', through: 'monitor_service', foreignKey: 'monitorId', otherKey: 'serviceUrl' })
    Monitor.hasMany(HealthCheck, { as: 'healthChecks', foreignKey: 'monitorId' })

    HealthCheck.belongsTo(Peer, { foreignKey: 'peerId' })
    HealthCheck.belongsTo(Service, { foreignKey: 'serviceUrl' })
    HealthCheck.belongsTo(Monitor, { foreignKey: 'monitorId' })
    
    Log.belongsTo(Peer, { foreignKey: 'peerId' })
    Log.belongsTo(Service, { foreignKey: 'serviceUrl' })

    this.Member = Member
    this.Service = Service
    this.Peer = Peer
    this.Monitor = Monitor
    this.HealthCheck = HealthCheck
    this.Log = Log

    if (config.initialiseDb) {
      this.sync()
    }
  }

  async sync () {
    console.debug('Syncing model structure to DB')
    await sequelize.sync({ force: false, alter: true });

    // console.debug('Creating models')
    // const [svc, _1] = await this.Service.upsert({
    //   serviceId: 'service2123',
    //   url: 'wss://test.com',
    // })
    // console.log('svc', svc)
    // const [peer, _2] = await this.Peer.upsert({
    //     peerId: 'peer123123',
    //     name: 'Test Peer'
    // })
    // await svc.setPeers(['peer123123'])
  }

  async close () {
    console.debug('Closing datastore...')
    return await sequelize.close()
  }

  async log(level='info', data) {
    const model = {
      level, data
    }
    return this.Log.create(model)
  }

  async prune () {
    console.debug('DataStore.prune()', this.pruning)
    const marker = moment.utc().add(-(this.pruning.age), 'seconds')
    console.debug('marker', marker)
    var result
    result = await this.HealthCheck.destroy({ where: { createdAt: { [Op.lt]: marker.format('YYYY-MM-DD HH:mm:ss') } } })
    console.debug('HealthCheck.prune: delete', result)
    result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, errorCount: { [Op.gt]: 10 } } })
    console.debug('Service.stale: error', result)
    result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, updatedAt: { [Op.lt]: marker } } })
    console.debug('Service.stale: updatedAt', result)
    // delete healthChecks for stale services
    const staleServices = this.Service.findAll({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    for(var i = 0; i < staleServices.length; i++) {
      const svc = staleServices[i]
      await this.HealthCheck.destroy({ where: { serviceUrl: svc.serviceUrl } })
    }
    // result = await this.HealthCheck.destroy({ where: })
    // delete stale services
    result = await this.Service.destroy({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    console.debug('Services.prune: stale', result)
    // TODO prune stale monitors
  }

}

export {
  DataStore
}
