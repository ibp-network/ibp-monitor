import { logModel } from '../models/log.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('log', logModel.definition)
    .sequelize.query(
      'CREATE TABLE `log` ( \
        `id` int(11) NOT NULL AUTO_INCREMENT, \
        `level` varchar(16) NOT NULL, \
        `peerId` varchar(128) NOT NULL, \
        `memberServiceId` int(11) NOT NULL, \
        `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)), \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
    .then(() =>
      queryInterface.addConstraint('log', {
        type: 'FOREIGN KEY',
        name: 'fk_log_member_service_node',
        fields: ['peerId'],
        references: {
          table: 'member_service_node',
          field: 'peerId',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      queryInterface.addConstraint('log', {
        type: 'FOREIGN KEY',
        name: 'fk_log_member_service',
        fields: ['memberServiceId'],
        references: {
          table: 'member_service',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('log')
}

export { up, down }
