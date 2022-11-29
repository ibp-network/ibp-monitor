
import { DataTypes, Sequelize, Model } from 'sequelize'

import { monitorModel } from '../models/monitor.js'
import { serviceModel } from '../models/service.js'
import { peerModel } from '../models/peer.js'
import { healthCheckModel } from '../models/healthCheck.js'
import { logModel } from '../models/log.js'

import { config } from '../config.js'
import { configLocal } from '../config.local.js'
const cfg = Object.assign(config, configLocal)
const sequelize = new Sequelize(cfg.sequelize.database, cfg.sequelize.username, cfg.sequelize.password, cfg.sequelize.options)

class DataStore {

  Service = undefined
  Peer = undefined
  HealthCheck = undefined
  Log = undefined
  pruning = 90 // days // TODO activate pruning!

  constructor(config = {}) {
    console.debug('DataStore()', config)
    this.pruning = config.pruning || 90
    const Monitor = sequelize.define('monitor', monitorModel.definition, { ...monitorModel.options, sequelize })
    const Peer = sequelize.define('peer', peerModel.definition, { ...peerModel.options, sequelize })
    const Service = sequelize.define('service', serviceModel.definition, { ...serviceModel.options, sequelize })
    const HealthCheck = sequelize.define('health_check', healthCheckModel.definition, { ...healthCheckModel.options, sequelize })
    const Log = sequelize.define('log', logModel.definition, { ...logModel.options, sequelize })

    // Monitor.hasMany(Service, { as: 'services' }) // not needed, it's stored in the monitor record
    Peer.belongsTo(Service, { as: 'service', foreignKey: 'serviceUrl' })
    Peer.hasMany(HealthCheck, { as: 'healthChecks', foreignKey: 'peerId' })
    Service.hasMany(Peer, { foreignKey: 'serviceUrl', otherKey: 'peerId' })
    Service.hasMany(HealthCheck, { as: 'healthChecks', foreignKey: 'serviceUrl' })
    HealthCheck.belongsTo(Peer, { foreignKey: 'peerId' })
    HealthCheck.belongsTo(Service, { foreignKey: 'serviceUrl' })
    Log.belongsTo(Peer, { foreignKey: 'peerId' })
    Log.belongsTo(Service, { foreignKey: 'serviceId' })

    this.Monitor = Monitor
    this.Peer = Peer
    this.Service = Service
    this.HealthCheck = HealthCheck
    this.Log = Log

    if (config.initialiseDb) {
      this.sync()
    }

  }

  async sync () {
    console.debug('Syncing model structure to DB')
    await this.Peer.sync({ alter: true })
    await this.Service.sync({ alter: true })
    await this.HealthCheck.sync({ alter: true })
    await this.Log.sync({ alter: true })
    await sequelize.sync({ force: true });

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

}

export {
  DataStore
}
