async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert('service', [
    {
      id: 'bridgehub-westend-rpc',
      chainId: 'bridgehub-westend',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'bridgehub-polkadot-rpc',
      chainId: 'bridgehub-polkadot',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
  ])
}

async function down({ context: queryInterface }) {
  // no-op
}

export { up, down }
