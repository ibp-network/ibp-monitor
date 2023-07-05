async function up(queryInterface, Sequelize) {
  await queryInterface
    // .addIndex('health_check', ['createdAt'])
    .sequelize.query(
      'ALTER TABLE `health_check` ADD INDEX IF NOT EXISTS `health_check_created_at` (`createdAt`)'
    )
}

async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex('health_check', ['createdAt'])
}

module.exports = { up, down }
