import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeConstraint('member_service_node', 'fk_member_service_node_member', {
      transaction,
    })
    await queryInterface.removeConstraint('member_service', 'fk_member_service_member', {
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
    await queryInterface.addConstraint('member_service_node', {
      type: 'FOREIGN KEY',
      name: 'fk_member_service_node_member',
      fields: ['memberId'],
      references: {
        table: 'member',
        field: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',

      transaction,
    })
    await queryInterface.addConstraint('member_service', {
      type: 'FOREIGN KEY',
      name: 'fk_member_service_member',
      fields: ['memberId'],
      references: {
        table: 'member',
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

export { up, down }
