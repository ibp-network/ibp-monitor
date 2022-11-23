
import express from 'express'
// const app = express()
// app.get('/*', (req, res, next) => hh.handleRequest(req, res, next))
// app.post('/*', (req, res, next) => hh.handlePost(req, res, next))
import fs from 'fs'
import ejs from 'ejs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const shortStash = function (stash) { return stash.slice(0, 6) + '...' + stash.slice(-6) }

class HttpHandler {

  app = undefined
  datastore = undefined
  templateDir = __dirname + '/../templates'
  // for display purposes // TODO move this to config?
  dateTimeFormat = 'YYYY.MM.DD HH:mm'

  constructor({ datastore, app, dateTimeFormat }) {
    this.datastore = datastore
    this.app = app ? app : express()
    this.dateTimeFormat = dateTimeFormat || 'YYYY/MM/DD HH:mm'
    this.setup()
  }

  setup () {
    this.app.set('view engine', 'ejs')

    this.app.get('/', (req, res) => {
      let tpl = this._geTemplate('index')
      let data = {
        templateDir: this.templateDir,
        peers: [
          { id: 1, name: 'peer 1', peerId: '123123123123'},
          { id: 2, name: 'peer 2', peerId: '456456456456'},
        ]
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

    this.app.get('/service', async (req, res) => {
      let tpl = this._geTemplate('services')
      let models = await this.datastore.service.findAll()
      let data = {
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        templateDir: this.templateDir,
        services: models,
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })
    this.app.get('/service/:serviceId', async (req, res) => {
      let { serviceId } = req.params
      let tpl = this._geTemplate('service')
      const model = await this.datastore.service.findOne({ serviceId })
      const healthChecks = await this.datastore.healthCheck.findAll({ where: { serviceId }, order: [['id', 'DESC']] })
      let data = {
        templateDir: this.templateDir,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        peer,
        healthChecks
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

    this.app.get('/peer', async (req, res) => {
      let tpl = this._geTemplate('peers')
      let peers = await this.datastore.peer.findAll()
      let data = {
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        templateDir: this.templateDir,
        peers,
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })
    this.app.get('/peer/:peerId', async (req, res) => {
      let { peerId } = req.params
      let tpl = this._geTemplate('peer')
      const peer = await this.datastore.peer.findByPk(peerId)
      const healthChecks = await this.datastore.healthCheck.findAll({ where: { peerId }, order: [['id', 'DESC']] })
      let data = {
        templateDir: this.templateDir,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        peer,
        healthChecks
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

  }

  listen (port, cb) {
    this.app.listen(port, cb)
  }

  _geTemplate (name) {
    return fs.readFileSync(`${this.templateDir}/${name}.ejs`, 'utf-8')
  }

  async handleRequest (req, res, next) {
    console.log('GET', req)
    //return Promise.resolve()
    const { url, method, baseUrl, originalUrl, params, query } = req
    switch(originalUrl) {
      case '/':
        break
      default:
        res.send('Hello world, GET')
    }
  }

  async handlePost (req, res, next) {
    console.log('POST', req)
    res.send('Hello world, GET')
  }

}

export {
  HttpHandler
}
