import { memberServiceModel } from '../models/member-service.js'

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('member_service', memberServiceModel.definition)
    .then(() =>
      queryInterface.addConstraint('member_service', {
        type: 'UNIQUE',
        name: 'u_member_service_member_service',
        fields: ['memberId', 'serviceId'],
      })
    )
    .then(() =>
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
