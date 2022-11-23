
// import mysql from 'mysql'
// import sqlite3 from 'sqlite3' //).verbose();
// keep in memory for now
import { DataTypes, Sequelize } from 'sequelize'
import { serviceModel } from '../models/service.js';
import { peerModel } from '../models/peer.js'
import { healthCheckModel } from '../models/healthCheck.js'

const db = new Sequelize({
  dialect: 'sqlite',
  storage: './data/datastore.sqlite',
  logging: false
});

class Model {
  tableName = undefined
  definition = undefined
  options = undefined

  constructor ({definition, options}, config) {
    this.tableName = options.tableName
    this.definition = definition
    this.options = options
    this._table = db.define(this.tableName, definition, options)
    // this.setup(config)
  }

  // handle async setup
  async setup (config) {
    console.debug('Model.setup()', this.tableName, config)
    await this._table.sync({ force: config.initialiseDb, alter: true })
  }

  async create (model) { return this._table.create(model) }
  // async upsert (pk, model) { 
  //   const exists = await this._table.findByPk(pk)
  //   if (exists) return this._table.update(model, { where: { id: pk } })
  //   else return this.create(model)
  // }
  async upsert (model, options={}) { return this._table.upsert(model, options) }
  async findByPk (pk) { return this._table.findByPk(pk) }
  async findOne (crit) { return this._table.findOne(crit) }
  async findAll (crit) { return crit ? this._table.findAll(crit) : this._table.findAll() }
  async delete (crit) { return this._table.destroy(crit) }
  async count (crit) { return this._table.count(crit) }
}

class DataStore {

  service = undefined
  peer = undefined
  healthCheck = undefined
  pruning = 90 // days // TODO activate pruning!

  constructor(config = {}) {
    console.debug('DataStore()', config)
    this.pruning = config.pruning || 90
    this.peer = new Model(peerModel, { initialiseDb: config.initialiseDb })
    this.service = new Model(serviceModel, { initialiseDb: config.initialiseDb })
    this.healthCheck = new Model(healthCheckModel, { initialiseDb: config.initialiseDb })
  }

  async close () {
    console.debug('Closing datastore...')
    return await db.close()
  }

  // /**
  //  * @deprecated use datastore.{model} functions
  //  */
  // async getAllHealthChecks (senderId = null) {
  //   if (senderId) {
  //     return this._healthChecks.findAll().filter(f => f.senderId === senderId)
  //   } else {
  //     return this._healthChecks.findAll()
  //   }
  // }

  // /**
  //  * @deprecated use datastore.{model} functions
  //  */
  //  async getHealthCheck (id = null) {
  //   return this._healthChecks.findByPk(id)
  // }

  // /**
  //  * @deprecated use datastore.{model} functions
  //  */
  //  async insertHealthCheck (senderId, healthCheck) {
  //   return this._healthChecks.create({
  //     // dateTime: new Date(), // will get now()
  //     senderId: senderId,
  //     peerId: healthCheck.peerId,
  //     record: JSON.stringify(healthCheck)
  //   })
  // }

  // /**
  //  * @deprecated use datastore.{model} functions
  //  */
  //  async deleteHealthCheck (id = null) {
  //   return this._healthChecks.destroy({ id: id })
  // }

}

export {
  DataStore
}
