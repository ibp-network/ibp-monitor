async function up({ context: queryInterface }) {
  await queryInterface.addIndex('health_check', ['createdAt'])
}

async function down({ context: queryInterface }) {
  await queryInterface.removeIndex('health_check', ['createdAt'])
}

export { up, down }
