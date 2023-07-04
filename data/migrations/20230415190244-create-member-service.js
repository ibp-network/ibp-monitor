import { memberServiceModel } from '../models/member-service.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('member_service', memberServiceModel.definition)
    .sequelize.query(
      'CREATE TABLE `member_service` ( \
        `id` int(11) NOT NULL AUTO_INCREMENT, \
        `memberId` varchar(128) NOT NULL, \
        `serviceId` varchar(128) NOT NULL, \
        `serviceUrl` varchar(256) NOT NULL, \
        `status` enum(\'active\',\'inactive\') NOT NULL, \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        `updatedAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
    .then(() =>
      // UNIQUE KEY `u_member_service_member_service` (`memberId`,`serviceId`), \
      queryInterface.addConstraint('member_service', {
        type: 'UNIQUE',
        name: 'u_member_service_member_service',
        fields: ['memberId', 'serviceId'],
      })
    )
    .then(() =>
      // CONSTRAINT `fk_member_service_member` FOREIGN KEY (`memberId`) REFERENCES `member` (`id`), \
      queryInterface.addConstraint('member_service', {
        type: 'FOREIGN KEY',
        name: 'fk_member_service_member',
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
      // CONSTRAINT `fk_member_service_service` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`)'
      // KEY `fk_member_service_service` (`serviceId`), \
      queryInterface.addConstraint('member_service', {
        type: 'FOREIGN KEY',
        name: 'fk_member_service_service',
        fields: ['serviceId'],
        references: {
          table: 'service',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('member_service')
}

export { up, down }
