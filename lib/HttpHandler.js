
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// import moment from 'moment'
import { Op } from 'sequelize'

import { PrometheusExporter } from './PrometheusExporter.js'

import { config } from '../config/config.js'
import { configLocal } from '../config/config.local.js'
const cfg = Object.assign(config, configLocal)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const shortStash = function (stash) { return stash?.slice(0, 6) + '...' + stash?.slice(-6) }

class HttpHandler {

  app = undefined
  datastore = undefined
  version = undefined
  // for display purposes // TODO move this to config?
  dateTimeFormat = 'YYYY.MM.DD HH:mm'
  localMonitorId = ''

  constructor({ datastore, app, dateTimeFormat, version }) {
    this._ds = datastore
    this.version = version
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

    // // debugging middleware for logging requests
    // this.app.use((req, res, next)=> {
    //   console.log('DEBUG:', req.path, req.params)
    //   next();
    // })

    // static route to vue-spa, which builds into static/index.html
    this.app.get(/^\/(?!api|metrics).*/, async (req, res) => {
      res.sendFile(path.join(__dirname, '/../static/index.html'));
    })

    this.app.get('/api/home', async (req, res) => {
      let monitorCount = await this._ds.Monitor.count()
      let memberCount = await this._ds.Member.count()
      let serviceCount = await this._ds.Service.count()
      let checkCount = await this._ds.HealthCheck.count()
      let config = cfg
      config.sequelize = {}
      let data = {
        version: this.version,
        localMonitorId: this.localMonitorId,
        config,
        monitorCount,
        memberCount,
        serviceCount,
        checkCount
      }
      res.json(data)
    })

    this.app.get('/api/domain', async (req, res) => {
      console.debug('/api/domain')
      let domains = await this._ds.Domain.findAll()
      res.json({ domains })
    })

    this.app.get('/api/member', async (req, res) => {
      console.debug('/api/member')
      let models = await this._ds.Member.findAll({ order: [['name', 'ASC']] })
      let data = {
        version: this.version,
        localMonitorId: this.localMonitorId,
        dateTimeFormat: this.dateTimeFormat,
        members: models,
      }
      res.json(data)
    })
    this.app.get('/api/member/:memberId', async (req, res) => {
      let { memberId } = req.params
      console.debug(`app.get(/api/member/${memberId})`)
      const member = await this._ds.Member.findByPk(memberId)
      const endpoints = await this._ds.Endpoint.findAll({ where: { memberId } })
      if (!member) {
        res.json({error: 'not found'})
      } else {
        const services = await this._ds.Service.findAll({ where: { level_required: { [Op.le]: member.current_level } } })
        let data = {
          version: this.version,
          localMonitorId: this.localMonitorId,
          dateTimeFormat: this.dateTimeFormat,
          member,
          services,
          endpoints
        }
        res.json(data)
      }
    })
    this.app.get('/api/member/:memberId/healthChecks', async (req, res) => {
      let { memberId } = req.params
      console.debug(`app.get(/api/member/${memberId}/healthChecks)`)
      const healthChecks = await this._ds.HealthCheck.findAll({ where: { memberId }, order: [['id', 'DESC']], limit: 25 })
      res.json({ healthChecks })
    })

    // Services
    this.app.get('/api/service', async (req, res) => {
      console.debug('/api/service')
      // let models = await this._ds.Service.findAll({ include: 'monitors', order: [['name', 'ASC']] })
      let services = await this._ds.Service.findAll({ order: [['name', 'ASC']] })
      let domains = await this._ds.Domain.findAll({ order: [['id', 'ASC']] })
      let data = {
        version: this.version,
        localMonitorId: this.localMonitorId,
        dateTimeFormat: this.dateTimeFormat,
        services,
        domains
      }
      res.json(data)
    })
    this.app.get('/api/service/:serviceId', async (req, res) => {
      let { serviceId } = req.params
      console.debug(`app.get(/api/service/${serviceId})`)
      // serviceUrl = decodeURIComponent(serviceUrl)
      const service = await this._ds.Service.findByPk(serviceId)
      // const service = this._ds.Service.findOne({ serviceUrl: serviceUrl }).data()
      if (!service) {
        // res.send(this._notFound())
        res.json({error: 'not found'})
      } else {
        const healthChecks = await this._ds.HealthCheck.findAll({ where: { serviceId }, order: [['id', 'DESC']], limit: 20 })
        // const healthChecks = this._ds.HealthCheck.chain().find({ serviceUrl }).simplesort('id', true).limit(10).data()
        healthChecks.forEach(check => check.record = this._toJson(check.record))
        let data = {
          version: this.version,
          localMonitorId: this.localMonitorId,
          dateTimeFormat: this.dateTimeFormat,
          service,
          // monitors: service.monitors,
          healthChecks
        }
        //let page = this._renderPage(tpl, data, {})
        res.json(data)
      }
    })

    // Endpoints
    this.app.get('/api/endpoint', async (req, res) => {
      console.debug('/api/endpoint')
      let models = await this._ds.Service.findAll({ include: 'monitors', order: [['name', 'ASC']] })
      let data = {
        version: this.version,
        localMonitorId: this.localMonitorId,
        dateTimeFormat: this.dateTimeFormat,
        endpoints: models,
      }
      res.json(data)
    })
    this.app.get('/api/endpoint/:endpointUrl', async (req, res) => {
      let { endpointUrl } = req.params
      console.debug(`app.get(/api/endpoint/${endpointUrl})`)
      endpointUrl = decodeURIComponent(endpointUrl)
      const endpoint = await this._ds.Service.findByPk(endpointUrl, { include: ['monitors', 'peers'] })
      // const endpoint = this._ds.Service.findOne({ endpointUrl: endpointUrl }).data()
      if (!endpoint) {
        // res.send(this._notFound())
        res.json({error: 'not found'})
      } else {
        const healthChecks = await this._ds.HealthCheck.findAll({ where: { endpointUrl }, order: [['id', 'DESC']], limit: 20 })
        // const healthChecks = this._ds.HealthCheck.chain().find({ endpointUrl }).simplesort('id', true).limit(10).data()
        healthChecks.forEach(check => check.record = this._toJson(check.record))
        let data = {
          version: this.version,
          localMonitorId: this.localMonitorId,
          dateTimeFormat: this.dateTimeFormat,
          endpoint,
          monitors: endpoint.monitors,
          healthChecks
        }
        //let page = this._renderPage(tpl, data, {})
        res.json(data)
      }
    })

    // Monitors
    this.app.get('/api/monitor', async (req, res) => {
      console.debug('/api/monitor')
      let monitors = await this._ds.Monitor.findAll()
      let data = {
        version: this.version,
        localMonitorId: this.localMonitorId,
        dateTimeFormat: this.dateTimeFormat,
        monitors,
      }
      res.json(data)
    })
    this.app.get('/api/monitor/:monitorId', async (req, res) => {
      console.debug('app.get(/api/monitor/:monitorId)', req.params)
      let { monitorId } = req.params
      const monitor = await this._ds.Monitor.findByPk(monitorId)
      // const monitor = await this._ds.Monitor.findOne({ monitorId }) // .data()
      if (!monitor) {
        // res.send(this._notFound())
        res.json({error: 'not found'})
      } else {
        const healthChecks = await this._ds.HealthCheck.findAll({ where: { monitorId }, order: [['id', 'DESC']], limit: 20 })
        healthChecks.forEach(check => check.record = this._toJson(check.record))
        let data = {
          version: this.version,
          localMonitorId: this.localMonitorId,
          // moment,
          // shortStash,
          dateTimeFormat: this.dateTimeFormat,
          monitor,
          // services: monitor.services,
          healthChecks
        }
        res.json(data)
      }
    })
    this.app.get('/api/healthCheck', async (req, res) => {
      console.debug('/api/healthCheck')
      let offset = Number(req.query.offset) || 0
      let limit = Number(req.query.limit) || 15
      let count = await this._ds.HealthCheck.count()
      let models = await this._ds.HealthCheck.findAll({ order: [['id', 'DESC']], limit, offset })
      models.forEach(model => {
        model.record = this._toJson(model.record)
      })
      let data = {
        version: this.version,
        localMonitorId: this.localMonitorId,
        dateTimeFormat: this.dateTimeFormat,
        models,
        count, limit, offset,
        pagination: this._pagination(count, offset, limit)
      }
      res.json(data)
    })
    this.app.get('/api/healthCheck/:id', async (req, res) => {
      console.debug('/api/healthCheck/:id', req.params, req.query)
      let { id } = req.params
      let { raw } = req.query
      let model = await this._ds.HealthCheck.findByPk(id)
      if (!model) {
        // res.send(this._notFound())
        res.json({error: 'not found'})
      } else {
        // mysql / mariadb old verions field is TEXT...
        model.record = this._toJson(model.record)
        if (raw) {
          res.json(model)
        } else {
          let data = {
            version: this.version,
            localMonitorId: this.localMonitorId,
            dateTimeFormat: this.dateTimeFormat,
            model
          }
          res.json(data)
        }  
      }
    })

    this.app.get('/api/metrics/:serviceUrl', async (req, res) => {
      let { serviceUrl } = req.params
      serviceUrl = decodeURIComponent(serviceUrl)
      console.debug('/metrics/', serviceUrl)
      let metrics = await this._exporter.export(serviceUrl)
      res.type('text/plain').send(metrics)
    })

    // this.app.get('/sign', async (req, res) => {
    //   let tpl = this._getTemplate('signature')
    //   let data = {
    //     version: this.version,
    //     localMonitorId: this.localMonitorId,
    //     moment,
    //     // shortStash,
    //     dateTimeFormat: this.dateTimeFormat,
    //     templateDir: this.templateDir,
    //   }
    //   let page = this._renderPage(tpl, data, {})
    //   res.send(page)
    // })
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

  // _getTemplate (name) {
  //   return fs.readFileSync(`${this.templateDir}/${name}.ejs`, 'utf-8')
  // }

  // _renderPage (template, data, options) {
  //   let page 
  //   try {
  //     page = ejs.render(template, data, options)
  //   } catch (err) {
  //     console.error(err)
  //     const errorPage = this._getTemplate('errorPage')
  //     page = ejs.render(errorPage, { ...data, template, error: err.toString() }, {})
  //   }
  //   return page
  // }

  // _notFound(context = {}) {
  //   const tpl = this._getTemplate('notFound')
  //   const page = this._renderPage(tpl, { templateDir: this.templateDir, localMonitorId: this.localMonitorId, context }, {})
  //   return page
  // }

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
