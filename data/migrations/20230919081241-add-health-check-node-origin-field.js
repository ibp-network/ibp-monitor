import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  try {
    await queryInterface.addColumn('health_check', 'checkOrigin', {
      type: DataTypes.ENUM('member', 'external'),
      allowNull: false,
      after: 'type',
    })
  } catch (err) {
    console.warn('Warning: could not add health_check.checkOrigin column')
  }
}

async function down({ context: queryInterface }) {
  try {
    await queryInterface.removeColumn('health_check', 'checkOrigin')
  } catch (err) {
    console.warn('Warning: health_check.checkOrigin does not exist')
  }
}

export { up, down }
