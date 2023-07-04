import { serviceModel } from '../models/service.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('service', serviceModel.definition)
    .sequelize.query(
      'CREATE TABLE `service` ( \
        `id` varchar(128) NOT NULL, \
        `chainId` varchar(64) NOT NULL, \
        `type` enum(\'rpc\',\'bootnode\') NOT NULL, \
        `membershipLevelId` int(11) NOT NULL, \
        `status` enum(\'active\',\'planned\') NOT NULL, \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        `updatedAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
    .then(() =>
      // UNIQUE KEY `u_service_chain_service_type` (`chainId`,`type`), \
      queryInterface.addConstraint('service', {
        type: 'UNIQUE',
        name: 'u_service_chain_service_type',
        fields: ['chainId', 'type'],
      })
    )
    .then(() =>
      // CONSTRAINT `fk_service_chain` FOREIGN KEY (`chainId`) REFERENCES `chain` (`id`), \
      queryInterface.addConstraint('service', {
        type: 'FOREIGN KEY',
        name: 'fk_service_chain',
        fields: ['chainId'],
        references: {
          table: 'chain',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    // KEY `fk_service_membership_level` (`membershipLevelId`), \
    .then(() =>
      // CONSTRAINT `fk_service_membership_level` FOREIGN KEY (`membershipLevelId`) REFERENCES `membership_level` (`id`)'
      queryInterface.addConstraint('service', {
        type: 'FOREIGN KEY',
        name: 'fk_service_membership_level',
        fields: ['membershipLevelId'],
        references: {
          table: 'membership_level',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('service')
}

export { up, down }
