import { membershipLevelModel } from '../models/membership-level.js'

async function up({ context: queryInterface }) {
  await queryInterface.createTable('membership_level', membershipLevelModel.definition).then(() =>
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
