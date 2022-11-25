
import { DataTypes, Sequelize, Model } from 'sequelize'
import { serviceModel } from '../models/service.js';
import { peerModel } from '../models/peer.js'
import { healthCheckModel } from '../models/healthCheck.js'
import { logModel } from '../models/log.js'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/datastore.sqlite',
  logging: false
});

class DataStore {

  Service = undefined
  Peer = undefined
  HealthCheck = undefined
  Log = undefined
  pruning = 90 // days // TODO activate pruning!

  constructor(config = {}) {
    console.debug('DataStore()', config)
    this.pruning = config.pruning || 90
    //const Peer = new Model(peerModel, { initialiseDb: config.initialiseDb })
    const Peer = sequelize.define('peer', peerModel.definition, { ...peerModel.options, sequelize })
    // const Peer = Model.init(peerModel.definition, { sequelize, ...peerModel.options })
    // const Service = new Model(serviceModel, { initialiseDb: config.initialiseDb })
    const Service = sequelize.define('service', serviceModel.definition, { ...serviceModel.options, sequelize })
    // const Service = Model.init(serviceModel.definition, { ...serviceModel.options, sequelize })
    // const HealthCheck = new Model(healthCheckModel, { initialiseDb: config.initialiseDb })
    const HealthCheck = sequelize.define('health_check', healthCheckModel.definition, { ...healthCheckModel.options, sequelize })
    // const HealthCheck = Model.init(healthCheckModel.definition, { ...healthCheckModel.options, sequelize })
    // const PeerService = 
    const Log = sequelize.define('log', logModel.definition, { ...logModel.options, sequelize })

    Peer.belongsToMany(Service, { as: 'services', through: 'peer_service', foreignKey: 'peerId', otherKey: 'serviceId' });
    // Peer.hasMany(Service, { as: 'services', foreignKey: 'peerId' })
    Peer.hasMany(HealthCheck, { as: 'healthChecks', foreignKey: 'peerId' })
    Service.belongsToMany(Peer, { through: 'peer_service', foreignKey: 'serviceId', otherKey: 'peerId' });
    HealthCheck.belongsTo(Peer, { foreignKey: 'peerId' })
    HealthCheck.belongsTo(Service, { foreignKey: 'serviceId' })
    Log.belongsTo(Peer, { foreignKey: 'peerId' })
    Log.belongsTo(Service, { foreignKey: 'serviceId' })

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
