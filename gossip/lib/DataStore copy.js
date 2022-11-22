
// import mysql from 'mysql'
import sqlite3 from 'sqlite3' //).verbose();
// keep in memory for now
// const db = new sqlite3.Database(':memory:')
// class HealthCheck {}
// import knex from 'knex'

// const db = knex({
//   client: 'sqlite3',
//   connection: {
//     filename: './datastore.sqlite'
//   }
// })

const db = new Sequelize({
  dialect: 'sqlite',
  storage: './datastore.sqlite'
});

class DataStore {
  // dateTime, sender, record
  healthChecks = []
  pruning = 90 // days

  constructor(config = {}) {
    this.pruning = config.pruning || 90
    if (config.initialiseDb) this.init()
  }

  // loadFromBase () {
  //   const file = '../data/'
  //   // TODO reload database from file
  // }

  async init () {
    console.debug('DataStore().init()...')
    // db.dropTable('health_check')
    db.schema.dropTableIfExists('health_check')
    db.schema.createTable('health_check', (table) => {
      table.increments('id')
      // table.timestamps('dateTime')
      // table.datetime('dateTime', { precision: 6 }).defaultTo(db.fn.now(6))
      table.timestamp('dateTime').defaultTo(db.fn.now());
      table.string('senderId')
      table.string('peerId')
      table.binary('record')
    })
  }

  async insert () {}
  async update () {}
  async upsert () {}

  async getAllHealthChecks (senderId = null) {
    if (senderId) {
      // return this.healthChecks.filter(f => f.senderId === senderId)
      return db('health_check').where('senderId', senderId)
    } else {
      // return this.healthChecks
      return db('health_check')
    }
  }

  async getHealthCheck (id = null) {
    // return this.healthChecks[id]
    return db('health_check').where('id', id)
  }

  async insertHealthCheck (senderId, healthCheck) {
    const id = db('health_check').insert({
      // dateTime: new Date(), // will get now()
      senderId: senderId,
      peerId: healthCheck.senderId,
      record: JSON.stringify(healthCheck)
    }, ['id'])
    return Promise.resolve(id)
  }

  async deleteHealthCheck (id = null) {
    // if (id) {
    //   this.healthChecks = this.healthChecks.filter((f, idx) => idx !== id)
    // }
    db('health_check').delete({ id: id })
    return Promise.resolve()
  }

}

export {
  DataStore
}
