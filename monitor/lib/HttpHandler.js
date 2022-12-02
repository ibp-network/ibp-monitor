
import express from 'express'
// const app = express()
// app.get('/*', (req, res, next) => hh.handleRequest(req, res, next))
// app.post('/*', (req, res, next) => hh.handlePost(req, res, next))
import fs from 'fs'
import ejs from 'ejs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment'

import { PrometheusExporter } from './PrometheusExporter.js'

import { config } from '../config.js'
import { configLocal } from '../config.local.js'
const cfg = Object.assign(config, configLocal)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const shortStash = function (stash) { return stash?.slice(0, 6) + '...' + stash?.slice(-6) }

class HttpHandler {

  app = undefined
  datastore = undefined
  templateDir = __dirname + '/../templates'
  // for display purposes // TODO move this to config?
  dateTimeFormat = 'YYYY.MM.DD HH:mm'
  localMonitorId = ''

  constructor({ datastore, app, dateTimeFormat }) {
    this._ds = datastore
    this.app = app 
      ? app
      : (() => {
        const app = express()
        app.use(express.static('static'))
        return app
      })()
    this.dateTimeFormat = dateTimeFormat || cfg.dateTimeFormat
    this._exporter = new PrometheusExporter(datastore)
    this.setup()
  }

  setLocalMonitorId (monitorId) {
    this.localMonitorId = monitorId
  }

  setup () {
    this.app.set('view engine', 'ejs')

    this.app.get('/', async (req, res) => {
      let tpl = this._getTemplate('index')
      let monitorCount = await this._ds.Monitor.count()
      let serviceCount = await this._ds.Service.count()
      let checkCount = await this._ds.HealthCheck.count()
      let data = {
        localMonitorId: this.localMonitorId,
        templateDir: this.templateDir,
        monitorCount,
        serviceCount,
        checkCount,
        // peers: [
        //   // { id: 1, name: 'peer 1', peerId: '123123123123'},
        //   // { id: 2, name: 'peer 2', peerId: '456456456456'},
        // ]
      }
      let page = this._renderPage(tpl, data, {})
      res.send(page)
    })

    this.app.get('/service', async (req, res) => {
      let tpl = this._getTemplate('services')
      let models = await this._ds.Service.findAll({ include: 'monitors' })
      // let models = this._ds.Service.chain().find().data()
      // console.log('services', models)
      let data = {
        localMonitorId: this.localMonitorId,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        templateDir: this.templateDir,
        services: models,
      }
      let page = this._renderPage(tpl, data, {})
      res.send(page)
    })
    this.app.get('/service/:serviceUrl', async (req, res) => {
      let { serviceUrl } = req.params
      serviceUrl = decodeURIComponent(serviceUrl)
      let tpl = this._getTemplate('service')
      const service = await this._ds.Service.findByPk(serviceUrl, { include: ['monitors', 'peers'] })
      // const service = this._ds.Service.findOne({ serviceUrl: serviceUrl }).data()
      if (!service) {
        res.send(this._notFound())
      } else {
        const healthChecks = await this._ds.HealthCheck.findAll({ where: { serviceUrl }, order: [['id', 'DESC']], limit: 20 })
        // const healthChecks = this._ds.HealthCheck.chain().find({ serviceUrl }).simplesort('id', true).limit(10).data()
        healthChecks.forEach(check => check.record = this._toJson(check.record))
        let data = {
          localMonitorId: this.localMonitorId,
          templateDir: this.templateDir,
          moment,
          shortStash,
          dateTimeFormat: this.dateTimeFormat,
          service,
          monitors: service.monitors,
          healthChecks
        }
        let page = this._renderPage(tpl, data, {})
        res.send(page)  
      }
    })

    this.app.get('/monitor', async (req, res) => {
      let tpl = this._getTemplate('monitors')
      let monitors = await this._ds.Monitor.findAll({include: ['services']})
      // let monitors = this._ds.Monitor.chain().find().data()
      // console.log('monitors', monitors)
      let data = {
        localMonitorId: this.localMonitorId,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        templateDir: this.templateDir,
        monitors,
      }
      let page = this._renderPage(tpl, data, {})
      res.send(page)
    })
    this.app.get('/monitor/:monitorId', async (req, res) => {
      console.debug('app.get(/monitor/:monitorId)', req.params)
      let { monitorId } = req.params
      let tpl = this._getTemplate('monitor')
      const monitor = await this._ds.Monitor.findByPk(monitorId, { include: 'services' })
      // const monitor = await this._ds.Monitor.findOne({ monitorId }) // .data()
      if (!monitor) {
        res.send(this._notFound())
      } else {
        //const services = await this._ds.Service.findAll({ where: { monitorId } })
        const healthChecks = await this._ds.HealthCheck.findAll({ where: { monitorId }, order: [['id', 'DESC']], limit: 10 })
        // const healthChecks = this._ds.HealthCheck.chain().find({ monitorId }).simplesort('id', true).limit(10).data()
        healthChecks.forEach(check => check.record = this._toJson(check.record))
        let data = {
          localMonitorId: this.localMonitorId,
          templateDir: this.templateDir,
          moment,
          shortStash,
          dateTimeFormat: this.dateTimeFormat,
          monitor,
          // services: monitor.services,
          healthChecks
        }
        let page = this._renderPage(tpl, data, {})
        res.send(page)
      }
    })

    this.app.get('/healthCheck', async (req, res) => {
      let offset = Number(req.query.offset) || 0
      let limit = Number(req.query.limit) || 15
      let tpl = this._getTemplate('healthChecks')
      let count = await this._ds.HealthCheck.count()
      let models = await this._ds.HealthCheck.findAll({ order: [['id', 'DESC']], limit, offset })
      // let count = this._ds.HealthCheck.count()
      // let models = this._ds.HealthCheck.chain().find().simplesort('id', true).limit(limit).offset(offset).data()
      models.forEach(model => {
        model.record = this._toJson(model.record)
      })
      let data = {
        localMonitorId: this.localMonitorId,
        moment,
        shortStash,
        dateTimeFormat: this.dateTimeFormat,
        templateDir: this.templateDir,
        models,
        count, limit, offset,
        pagination: this._pagination(count, offset, limit)
      }
      let page = this._renderPage(tpl, data, {})
      res.send(page)
    })
    this.app.get('/healthCheck/:id', async (req, res) => {
      let { id } = req.params
      let { raw } = req.query
      let tpl = this._getTemplate('healthCheck')
      let model = await this._ds.HealthCheck.findByPk(id)
      // let model = this._ds.HealthCheck.findOne({ id })
      if (!model) {
        res.send(this._notFound())
      } else {
        // mysql / mariadb old verions field is TEXT...
        model.record = this._toJson(model.record)
        if (raw) {
          res.json(model)
        } else {
          let data = {
            localMonitorId: this.localMonitorId,
            moment,
            shortStash,
            dateTimeFormat: this.dateTimeFormat,
            templateDir: this.templateDir,
            model
          }
          let page = this._renderPage(tpl, data, {})
          res.send(page)
        }  
      }
    })

    this.app.get('/metrics/:serviceUrl', async (req, res) => {
      let { serviceUrl } = req.params
      console.debug('/metrics/', serviceUrl)
      let metrics = await this._exporter.export(serviceUrl)
      res.type('text/plain').send(metrics)
    })
  }

  listen (port, cb) {
    this.app.listen(port, cb)
  }

  _toJson (record) {
    var ret = record
    // console.debug('record is type', typeof record)
    if (typeof record === 'string') {
      try { ret = JSON.parse(record)} catch (err) {
        console.warn('can not parse', record, 'to json')
      }
    }
    return ret
  }

  _getTemplate (name) {
    return fs.readFileSync(`${this.templateDir}/${name}.ejs`, 'utf-8')
  }

  _renderPage (template, data, options) {
    let page 
    try {
      page = ejs.render(template, data, options)
    } catch (err) {
      console.error(err)
      const errorPage = this._getTemplate('errorPage')
      page = ejs.render(errorPage, { ...data, template, error: err.toString() }, {})
    }
    return page
  }

  _notFound(context = {}) {
    const tpl = this._getTemplate('notFound')
    const page = this._renderPage(tpl, { templateDir: this.templateDir, localMonitorId: this.localMonitorId, context }, {})
    return page
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
