
async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('member', 'monitorUrl', {
    type: Sequelize.DataTypes.STRING(132),
    allowNull: true,
  })
}

async function down(queryInterface, Sequelize) {
  // await queryInterface.removeColumn('member', 'monitorUrl')
}

module.exports = { up, down }
