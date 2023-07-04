import { membershipLevelModel } from '../models/membership-level.js'

async function up({ context: queryInterface }) {
  // await queryInterface.createTable('membership_level', membershipLevelModel.definition).then(() =>
  await queryInterface.sequelize.query(
    'CREATE TABLE `membership_level` ( \
      `id` int(11) NOT NULL, \
      `name` varchar(64) NOT NULL, \
      `subdomain` varchar(64) NOT NULL, \
      `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
      PRIMARY KEY (`id`) \
    )'
  )
  .then(() =>
    // UNIQUE KEY `u_membership_level_name` (`name`)
    queryInterface.addConstraint('membership_level', {
      type: 'UNIQUE',
      name: 'u_membership_level_name',
      fields: ['name'],
    })
  )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('membership_level')
}

export { up, down }
