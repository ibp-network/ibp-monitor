import { geoDnsPoolModel } from '../models/geo-dns-pool.js'

async function up({ context: queryInterface }) {
  await queryInterface.createTable('geo_dns_pool', geoDnsPoolModel.definition)
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('geo_dns_pool')
}

export { up, down }
