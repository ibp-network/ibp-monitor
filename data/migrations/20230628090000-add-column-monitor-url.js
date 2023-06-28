import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  await queryInterface.addColumn('member', 'monitorUrl', {
    type: DataTypes.STRING(132),
    allowNull: true,
  })
}

async function down({ context: queryInterface }) {
  // await queryInterface.removeColumn('member', 'monitorUrl')
}

export { up, down }
