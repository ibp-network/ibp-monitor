async function up({ context: queryInterface }) {
  await queryInterface
    // .addIndex('health_check', ['createdAt'])
    .sequelize.query(
      'ALTER TABLE `health_check` ADD INDEX IF NOT EXISTS `health_check_created_at` (`createdAt`)'
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.removeIndex('health_check', ['createdAt'])
}

export { up, down }
