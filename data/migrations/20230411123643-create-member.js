import { memberModel } from '../models/member.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('member', memberModel.definition)
    .sequelize.query(
      'CREATE TABLE `member` ( \
        `id` varchar(128) NOT NULL, \
        `name` varchar(128) NOT NULL, \
        `websiteUrl` varchar(256) DEFAULT NULL, \
        `logoUrl` varchar(256) DEFAULT NULL, \
        `serviceIpAddress` varchar(64) NOT NULL, \
        `membershipType` enum(\'hobbyist\',\'professional\') NOT NULL, \
        `membershipLevelId` int(11) NOT NULL, \
        `membershipLevelTimestamp` int(11) NOT NULL, \
        `status` enum(\'active\',\'pending\') NOT NULL, \
        `region` enum(\'africa\',\'asia\',\'central_america\',\'europe\',\'middle_east\',\'north_america\',\'oceania\') NOT NULL DEFAULT \'europe\', \
        `latitude` float NOT NULL, \
        `longitude` float NOT NULL, \
        `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
        `updatedAt` datetime NOT NULL DEFAULT current_timestamp(), \
        PRIMARY KEY (`id`) \
      )'
    )
    // KEY `fk_member_membership_level` (`membershipLevelId`)'
    // CONSTRAINT `fk_member_membership_level` FOREIGN KEY (`membershipLevelId`) REFERENCES `membership_level` (`id`)'
    .then(() => queryInterface.addConstraint('member', {
      type: 'FOREIGN KEY',
      name: 'fk_member_membership_level',
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
  await queryInterface.dropTable('member')
}

export { up, down }
