
async function up({ context: queryInterface }) {
  try {
    queryInterface
      //.removeColumn('member_service_node', 'memberServiceId')
      .sequelize.query(`ALTER TABLE member_service_node DROP COLUMN IF EXISTS memberServiceId;`)
  } catch (err) {
    console.warn('Warning: member_service_node.memberServiceId does not exist')
  }
}

async function down({ context: queryInterface }) {
}

export { up, down }
