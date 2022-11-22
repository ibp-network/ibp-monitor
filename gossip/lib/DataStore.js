
// import mysql from 'mysql'
// import sqlite3 from 'sqlite3' //).verbose();
// keep in memory for now
import { DataTypes, Sequelize } from 'sequelize'

const db = new Sequelize({
  dialect: 'sqlite',
  storage: './data/datastore.sqlite'
});

class DataStore {
  // dateTime, sender, record
  healthChecks = undefined
  pruning = 90 // days

  constructor(config = {}) {
    console.debug('DataStore()', config)
    // this.pruning = config.pruning || 90
    // if (config.initialiseDb) this.init()

    this.healthChecks = db.define('health_checks', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      // dateTime: { type: DataTypes.STRING },
      senderId: { type: DataTypes.STRING },
      peerId: { type: DataTypes.STRING },
      record: { type: DataTypes.STRING },
    }, {
      tableName: 'health_checks',
      timestamps: true,
      createdAt: true,
      updatedAt: false
    })
    this.healthChecks.sync({ force: config.initialiseDb, alter: true })
  }

  // loadFromBase () {
  //   const file = '../data/'
  //   // TODO reload database from file
  // }

  async init () {
  //   console.debug('DataStore().init()...')
  //   // db.dropTable('health_check')
  //   db.schema.dropTableIfExists('health_check')
  //   db.schema.createTable('health_check', (table) => {
  //     table.increments('id')
  //     // table.timestamps('dateTime')
  //     // table.datetime('dateTime', { precision: 6 }).defaultTo(db.fn.now(6))
  //     table.timestamp('dateTime').defaultTo(db.fn.now());
  //     table.string('senderId')
  //     table.string('peerId')
  //     table.binary('record')
  //   })
  }

  async insert () {}
  async update () {}
  async upsert () {}

  async getAllHealthChecks (senderId = null) {
    if (senderId) {
      return this.healthChecks.findAll().filter(f => f.senderId === senderId)
    } else {
      return this.healthChecks.findAll()
    }
  }

  async getHealthCheck (id = null) {
    return this.healthChecks.findByPk(id)
  }

  async insertHealthCheck (senderId, healthCheck) {
    return this.healthChecks.create({
      // dateTime: new Date(), // will get now()
      senderId: senderId,
      peerId: healthCheck.peerId,
      record: JSON.stringify(healthCheck)
    })
  }

  async deleteHealthCheck (id = null) {
    return this.healthChecks.destroy({ id: id })
  }

}

export {
  DataStore
}
