import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeColumn('health_check', 'checkOrigin', {
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
    await queryInterface.addColumn('health_check', 'checkOrigin', {
      type: DataTypes.ENUM('member', 'external'),
      allowNull: false,
      after: 'type',

      transaction,
    })

    await queryInterface.query(
      `
      UPDATE health_check
      SET checkOrigin = 'member'
      WHERE memberId != NULL
    `,
      { transaction }
    )

    await queryInterface.query(
      `
      UPDATE health_check
      SET checkOrigin = 'external'
      WHERE memberId == NULL
    `,
      { transaction }
    )

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export { up, down }
