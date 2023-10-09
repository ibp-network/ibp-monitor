import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeConstraint('health_check', 'fk_health_check_member_service_node', {
      transaction,
    })

    await queryInterface.renameTable('member_service_node', 'provider_service_node', {
      transaction,
    })
    await queryInterface.renameTable('member_service', 'provider_service', { transaction })

    await queryInterface.addConstraint('health_check', {
      type: 'FOREIGN KEY',
      name: 'fk_health_check_provider_service_node',
      fields: ['peerId'],
      references: {
        table: 'provider_service_node',
        field: 'peerId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',

      transaction,
    })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeConstraint('health_check', 'fk_health_check_provider_service_node', {
      transaction,
    })

    await queryInterface.renameTable('provider_service_node', 'member_service_node', {
      transaction,
    })
    await queryInterface.renameTable('provider_service', 'member_service', { transaction })

    await queryInterface.addConstraint('health_check', {
      type: 'FOREIGN KEY',
      name: 'fk_health_check_member_service_node',
      fields: ['peerId'],
      references: {
        table: 'member_service_node',
        field: 'peerId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',

      transaction,
    })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export { up, down }
