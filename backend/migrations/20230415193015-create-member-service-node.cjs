
async function up(queryInterface, Sequelize) {
  await queryInterface
    // .createTable('member_service_node', memberServiceNodeModel.definition)
    .sequelize.query(
      'CREATE TABLE `member_service_node` ( \
        `peerId` varchar(64) NOT NULL, \
        `serviceId` varchar(128) NOT NULL, \
        `memberId` varchar(128) NOT NULL, \
        `memberServiceId` int(11) NOT NULL, \
        `name` varchar(128) DEFAULT NULL, \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        `updatedAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`peerId`) \
      )'
    )
    .then(() =>
      // KEY `fk_member_service_node_service` (`serviceId`), \
      // CONSTRAINT `fk_member_service_node_service` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`) \
      queryInterface.addConstraint('member_service_node', {
        type: 'FOREIGN KEY',
        name: 'fk_member_service_node_service',
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
      // KEY `fk_member_service_node_member` (`memberId`), \
      // CONSTRAINT `fk_member_service_node_member` FOREIGN KEY (`memberId`) REFERENCES `member` (`id`), \
      queryInterface.addConstraint('member_service_node', {
        type: 'FOREIGN KEY',
        name: 'fk_member_service_node_member',
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
      queryInterface.addConstraint('member_service_node', {
        type: 'FOREIGN KEY',
        name: 'fk_member_service_node_member_service',
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

async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('member_service_node')
}

module.exports = { up, down }
