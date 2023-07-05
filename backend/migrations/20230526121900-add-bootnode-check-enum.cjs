
async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('health_check', 'type', {
    type: Sequelize.DataTypes.ENUM('service_check', 'system_health', 'best_block', 'bootnode_check'),
    allowNull: false,
  })
}

async function down(queryInterface, Sequelize) {
  // no-op
}

module.exports = { up, down }
