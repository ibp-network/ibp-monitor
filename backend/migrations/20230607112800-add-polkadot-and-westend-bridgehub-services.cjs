async function up(queryInterface, Sequelize) {
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

async function down(queryInterface, Sequelize) {
  // no-op
}

module.exports = { up, down }
