import { healthCheckModel } from '../models/health-check.js'

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('health_check', healthCheckModel.definition)
    .then(() =>
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_monitor',
        fields: ['monitorId'],
        references: {
          table: 'monitor',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_service',
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
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_member',
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
      queryInterface.addConstraint('health_check', {
        type: 'FOREIGN KEY',
        name: 'fk_health_check_member_service_node',
        fields: ['peerId'],
        references: {
          table: 'member_service_node',
          field: 'peerId',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('health_check')
}

export { up, down }
