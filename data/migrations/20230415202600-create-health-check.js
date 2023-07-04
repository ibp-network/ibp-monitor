import { healthCheckModel } from '../models/health-check.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('health_check', healthCheckModel.definition)
    .sequelize.query(
      'CREATE TABLE `health_check` ( \
        `id` int(11) NOT NULL AUTO_INCREMENT, \
        `monitorId` varchar(64) NOT NULL, \
        `serviceId` varchar(128) NOT NULL, \
        `memberId` varchar(128) NOT NULL, \
        `peerId` varchar(64) DEFAULT NULL, \
        `source` enum(\'check\',\'gossip\') NOT NULL, \
        `type` enum(\'service_check\',\'system_health\',\'best_block\',\'bootnode_check\') NOT NULL, \
        `status` enum(\'error\',\'warning\',\'success\') NOT NULL, \
        `responseTimeMs` int(11) DEFAULT NULL, \
        `record` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`record`)), \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
    // KEY `health_check_created_at` (`createdAt`) \
    .then(() =>
      // CONSTRAINT `fk_health_check_monitor` FOREIGN KEY (`monitorId`) REFERENCES `monitor` (`id`), \
      // KEY `fk_health_check_monitor` (`monitorId`), \
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_monitor',
        fields: ['monitorId'],
        references: {
          table: 'monitor',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      // CONSTRAINT `fk_health_check_service` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`)
      // KEY `fk_health_check_service` (`serviceId`), \
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_service',
        fields: ['serviceId'],
        references: {
          table: 'service',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      // CONSTRAINT `fk_health_check_member` FOREIGN KEY (`memberId`) REFERENCES `member` (`id`), \
      // KEY `fk_health_check_member` (`memberId`), \
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_member',
        fields: ['memberId'],
        references: {
          table: 'member',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      // CONSTRAINT `fk_health_check_member_service_node` FOREIGN KEY (`peerId`) REFERENCES `member_service_node` (`peerId`), \
      // KEY `fk_health_check_member_service_node` (`peerId`), \
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_member_service_node',
        fields: ['peerId'],
        references: {
          table: 'member_service_node',
          field: 'peerId',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('health_check')
}

export { up, down }
