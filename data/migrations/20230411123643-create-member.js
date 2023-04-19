import { memberModel } from '../models/member.js'

async function up({ context: queryInterface }) {
  await queryInterface.createTable('member', memberModel.definition).then(() =>
    queryInterface.addConstraint('member', {
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
