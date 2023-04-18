import { logModel } from '../models/log.js'

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('log', logModel.definition)
    .then(() =>
      queryInterface.addConstraint('log', {
        type: 'FOREIGN KEY',
        name: 'fk_log_member_service_node',
        fields: ['peerId'],
        references: {
          table: 'member_service_node',
          field: 'peerId',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      queryInterface.addConstraint('log', {
        type: 'FOREIGN KEY',
        name: 'fk_log_member_service',
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
  await queryInterface.dropTable('log')
}

export { up, down }
