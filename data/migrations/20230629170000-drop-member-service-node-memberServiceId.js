
async function up({ context: queryInterface }) {
  try {
    queryInterface.removeColumn('member_service_node', 'memberServiceId')
  } catch (err) {
    console.warn('Warning: member_service_node.memberServiceId does not exist')
  }
}

async function down({ context: queryInterface }) {
}

export { up, down }
