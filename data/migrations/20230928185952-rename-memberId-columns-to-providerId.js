import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn('health_check', 'providerId', {
      type: DataTypes.STRING(128),
      after: 'serviceId',
      allowNull: false,

      transaction,
    })
    await queryInterface.changeColumn('health_check', 'member', {
      type: DataTypes.STRING(128),
      after: 'providerId',
      allowNull: true,

      transaction,
    })

    await queryInterface.renameColumn('member_service_node', 'memberId', 'providerId', {
      transaction,
    })
    await queryInterface.renameColumn('member_service', 'memberId', 'providerId', { transaction })

    await queryInterface.addConstraint('health_check', {
      type: 'FOREIGN KEY',
      name: 'fk_health_check_provider',
      fields: ['providerId'],
      references: {
        table: 'provider',
        field: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',

      transaction,
    })
    await queryInterface.addConstraint('member_service_node', {
      type: 'FOREIGN KEY',
      name: 'fk_member_service_node_provider',
      fields: ['providerId'],
      references: {
        table: 'provider',
        field: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',

      transaction,
    })
    await queryInterface.addConstraint('member_service', {
      type: 'FOREIGN KEY',
      name: 'fk_member_service_provider',
      fields: ['providerId'],
      references: {
        table: 'provider',
        field: 'id',
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
    await queryInterface.removeConstraint('health_check', 'fk_health_check_provider', {
      transaction,
    })
    await queryInterface.removeConstraint(
      'member_service_node',
      'fk_member_service_node_provider',
      {
        transaction,
      }
    )
    await queryInterface.removeConstraint('member_service', 'fk_member_service_provider', {
      transaction,
    })

    await queryInterface.renameColumn('health_check', 'providerId', 'memberId', { transaction })
    await queryInterface.renameColumn('member_service_node', 'providerId', 'memberId', {
      transaction,
    })
    await queryInterface.renameColumn('member_service', 'providerId', 'memberId', { transaction })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export { up, down }
