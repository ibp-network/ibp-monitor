import { serviceModel } from '../models/service.js'

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('service', serviceModel.definition)
    .then(() =>
      queryInterface.addConstraint('service', {
        type: 'UNIQUE',
        name: 'u_service_chain_service_type',
        fields: ['chainId', 'type'],
      })
    )
    .then(() =>
      queryInterface.addConstraint('service', {
        type: 'FOREIGN KEY',
        name: 'fk_service_chain',
        fields: ['chainId'],
        references: {
          table: 'chain',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      queryInterface.addConstraint('service', {
        type: 'FOREIGN KEY',
        name: 'fk_service_membership_level',
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
  await queryInterface.dropTable('service')
}

export { up, down }
