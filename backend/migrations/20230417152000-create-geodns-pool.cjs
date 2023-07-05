
async function up(queryInterface, Sequelize) {
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

async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('geo_dns_pool')
}

module.exports = { up, down }
