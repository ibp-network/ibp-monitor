import { memberServiceNodeModel } from '../models/member_service_node.js'

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('member_service_node', memberServiceNodeModel.definition)
    .then(() =>
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

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('member_service_node')
}

export { up, down }
