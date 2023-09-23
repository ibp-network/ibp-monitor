import { Sequelize } from 'sequelize'
import { Umzug, SequelizeStorage } from 'umzug'
import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'
import { DataStore } from '../data/data-store.js'

const cfg = Object.assign(config, configLocal)
const ds = new DataStore({ pruning: cfg.pruning })
const sequelize = new Sequelize(
  cfg.sequelize.database,
  cfg.sequelize.username,
  cfg.sequelize.password,
  cfg.sequelize.options
)

;(async () => {
  const umzug = new Umzug({
    migrations: {
      glob: './migrations/*.js',
      resolve: (params) => {
        if (params.path.endsWith('.mjs') || params.path.endsWith('.js')) {
          const getModule = () => import(`file:///${params.path.replace(/\\/g, '/')}`)
          return {
            name: params.name,
            path: params.path,
            up: async (upParams) => (await getModule()).up(upParams),
            down: async (downParams) => (await getModule()).up(downParams),
          }
        }
        return {
          name: params.name,
          path: params.path,
          ...require(params.path),
        }
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, modelName: 'sequelize_migrations' }),
    logger: console,
  })
  console.log('Running migrations...')
  await umzug.up()

  setTimeout(() => {
    process.exit(0)
  }, 1000)
})()
