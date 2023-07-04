import { monitorModel } from '../models/monitor.js'

async function up({ context: queryInterface }) {
  await queryInterface
  // .createTable('monitor', monitorModel.definition)
    .sequelize.query(
      'CREATE TABLE `monitor` ( \
        `id` varchar(64) NOT NULL, \
        `name` varchar(128) DEFAULT NULL, \
        `multiaddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`multiaddress`)), \
        `status` enum(\'active\',\'inactive\') NOT NULL DEFAULT \'active\', \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        `updatedAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('monitor')
}

export { up, down }
