import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  await queryInterface.changeColumn('health_check', 'type', {
    type: DataTypes.ENUM('service_check', 'system_health', 'best_block', 'bootnode_check'),
    allowNull: false,
  })
}

async function down({ context: queryInterface }) {
  // no-op
}

export { up, down }
