
import express from 'express'
// const app = express()
// app.get('/*', (req, res, next) => hh.handleRequest(req, res, next))
// app.post('/*', (req, res, next) => hh.handlePost(req, res, next))
import fs from 'fs'
import ejs from 'ejs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment'

import { config } from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const shortStash = function (stash) { return stash?.slice(0, 6) + '...' + stash?.slice(-6) }

class HttpHandler {

  app = undefined
  datastore = undefined
  templateDir = __dirname + '/../templates'
  // for display purposes // TODO move this to config?
  dateTimeFormat = 'YYYY.MM.DD HH:mm'
  localPeerId = ''

  constructor({ datastore, app, dateTimeFormat }) {
    this.datastore = datastore
    this.app = app 
      ? app
      : (() => {
        const app = express()
        app.use(express.static('static'))
        return app
      })()
    this.dateTimeFormat = dateTimeFormat || config.dateTimeFormat
    this.setup()
  }

  setLocalPeerId (peerId) {
    this.localPeerId = peerId
  }

  setup () {
    this.app.set('view engine', 'ejs')

    this.app.get('/', async (req, res) => {
      let tpl = this._getTemplate('index')
      let peerCount = await this.datastore.Peer.count()
      let serviceCount = await this.datastore.Service.count()
      let checkCount = await this.datastore.HealthCheck.count()
      let data = {
        localPeerId: this.localPeerId,
        templateDir: this.templateDir,
        peerCount,
        serviceCount,
        checkCount,
        // peers: [
        //   // { id: 1, name: 'peer 1', peerId: '123123123123'},
        //   // { id: 2, name: 'peer 2', peerId: '456456456456'},
        // ]
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

    this.app.get('/service', async (req, res) => {
      let tpl = this._getTemplate('services')
      let models = await this.datastore.Service.findAll({ include: 'peers' })
      let data = {
        localPeerId: this.localPeerId,
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
      let tpl = this._getTemplate('service')
      const service = await this.datastore.Service.findByPk(serviceId, { include: 'peers' })
      const healthChecks = await this.datastore.HealthCheck.findAll({ where: { serviceId }, order: [['id', 'DESC']], limit: 10 })
      let data = {
        localPeerId: this.localPeerId,
        templateDir: this.templateDir,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        service,
        peers: service.peers,
        healthChecks
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

    this.app.get('/peer', async (req, res) => {
      let tpl = this._getTemplate('peers')
      let peers = await this.datastore.Peer.findAll({include: 'services'})
      let data = {
        localPeerId: this.localPeerId,
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
      console.debug('app.get(/peer/:peerId)', req.params)
      let { peerId } = req.params
      let tpl = this._getTemplate('peer')
      const peer = await this.datastore.Peer.findByPk(peerId, { include: ['services'] })
      //const services = await this.datastore.Service.findAll({ where: { peerId } })
      const healthChecks = await this.datastore.HealthCheck.findAll({ where: { peerId }, order: [['id', 'DESC']], limit: 10 })
      let data = {
        localPeerId: this.localPeerId,
        templateDir: this.templateDir,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        peer,
        services: peer.services,
        healthChecks
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

    this.app.get('/healthCheck', async (req, res) => {
      let offset = Number(req.query.offset) || 0
      let limit = Number(req.query.limit) || 15
      let tpl = this._getTemplate('healthChecks')
      let count = await this.datastore.HealthCheck.count()
      let models = await this.datastore.HealthCheck.findAll({ order: [['id', 'DESC']], limit, offset, include: 'service' })
      let data = {
        localPeerId: this.localPeerId,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        templateDir: this.templateDir,
        models,
        count, limit, offset,
        pagination: this._pagination(count, offset, limit)
      }
      let page = ejs.render(tpl, data, {})
      res.send(page)
    })

    this.app.get('/healthCheck/:id', async (req, res) => {
      let { id } = req.params
      let { raw } = req.query
      let tpl = this._getTemplate('healthCheck')
      let model = await this.datastore.HealthCheck.findByPk(id)
      if (raw) {
        res.json(model)
      } else {
        let data = {
          localPeerId: this.localPeerId,
          moment,
          shortStash,
          dateTimeFormat: this.dateTimeFormat,
          templateDir: this.templateDir,
          model
        }
        let page = ejs.render(tpl, data, {})
        res.send(page)
      }
    })

  }

  listen (port, cb) {
    this.app.listen(port, cb)
  }

  _getTemplate (name) {
    return fs.readFileSync(`${this.templateDir}/${name}.ejs`, 'utf-8')
  }

  /**
   * Create data for the pagination template object
   * @param {*} count 
   * @param {*} offset 
   * @param {*} limit 
   * @returns 
   */
  _pagination (count, offset, limit) {
    console.debug('_pagination()', count, offset, limit)
    var pages = []
    const pageCount = Math.ceil(count/limit)
    const currentPage = Math.min(Math.ceil(offset/limit)+1, pageCount) // 11/2 = 5
    // console.debug('currentPage', currentPage)
    for (var i = 1; i <= pageCount; i++) {
      const page = {
        query: `?offset=${(i-1) * limit}&limit=${limit}`,
        class: 'pagination-link',
        text: `${i}`,
        current: i == currentPage
      }
      pages.push(page)
    }
    if (pages.length > 10) {
      if (currentPage <= 3 || currentPage >= (pageCount - 3)) {
        pages = [].concat(
          pages.slice(0, 5),
          [{ class: 'pagination-ellipsis', text: '∙∙∙' }],
          pages.slice(-5)
        )  
      } else {
        pages = [].concat(
          pages.slice(0, 1),
          [{ class: 'pagination-ellipsis', text: '∙∙∙' }],
          pages.slice(currentPage - 3, currentPage + 2),
          [{ class: 'pagination-ellipsis', text: '∙∙∙' }],
          pages.slice(-1)
        )
      }
    }
    // console.debug(pages)
    const prev = { query: `?offset=${ Math.max(offset-limit, 0) }&limit=${limit}` }
    const next = currentPage < pageCount
      ? { query: `?offset=${ offset + limit }&limit=${limit}` }
      : { query: `?offset=${ offset }&limit=${limit}` }
    // console.debug('next', next)
    return { pages, prev, next }
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
