import { geoDnsPoolModel } from '../models/geo-dns-pool.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('geo_dns_pool', geoDnsPoolModel.definition)
    .sequelize.query(
      'CREATE TABLE `geo_dns_pool` ( \
        `id` int(11) NOT NULL AUTO_INCREMENT, \
        `name` varchar(128) NOT NULL, \
        `host` varchar(256) DEFAULT NULL, \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('geo_dns_pool')
}

export { up, down }
