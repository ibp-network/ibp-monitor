import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn(
      'member',
      'providerId',
      {
        type: DataTypes.STRING(128),
        allowNull: false,
        after: 'id',
      },
      { transaction }
    )

    await queryInterface.sequelize.query(
      `
      UPDATE member
      SET providerId = id
    `,
      { transaction }
    )

    await queryInterface.addConstraint('member', {
      type: 'FOREIGN KEY',
      name: 'fk_member_provider',
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
    await queryInterface.removeConstraint('member', 'fk_member_provider', {
      transaction,
    })
    await queryInterface.removeColumn('member', 'providerId')

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export { up, down }
