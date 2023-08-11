async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('service', [
    // level 1
    {
      id: 'westend-bootnode',
      chainId: 'westend',
      type: 'bootnode',
      membershipLevelId: 1,
      status: 'active',
    },
    {
      id: 'kusama-bootnode',
      chainId: 'kusama',
      type: 'bootnode',
      membershipLevelId: 1,
      status: 'active',
    },
    {
      id: 'polkadot-bootnode',
      chainId: 'polkadot',
      type: 'bootnode',
      membershipLevelId: 1,
      status: 'active',
    },
    // level 3
    {
      id: 'westend-rpc',
      chainId: 'westend',
      type: 'rpc',
      membershipLevelId: 3,
      status: 'active',
    },
    {
      id: 'kusama-rpc',
      chainId: 'kusama',
      type: 'rpc',
      membershipLevelId: 3,
      status: 'active',
    },
    {
      id: 'polkadot-rpc',
      chainId: 'polkadot',
      type: 'rpc',
      membershipLevelId: 3,
      status: 'active',
    },
    // level 4
    {
      id: 'westmint-bootnode',
      chainId: 'westmint',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    {
      id: 'collectives-westend-bootnode',
      chainId: 'collectives-westend',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    {
      id: 'statemine-bootnode',
      chainId: 'statemine',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    {
      id: 'bridgehub-kusama-bootnode',
      chainId: 'bridgehub-kusama',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    {
      id: 'encointer-kusama-bootnode',
      chainId: 'encointer-kusama',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    {
      id: 'statemint-bootnode',
      chainId: 'statemint',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    {
      id: 'collectives-polkadot-bootnode',
      chainId: 'collectives-polkadot',
      type: 'bootnode',
      membershipLevelId: 4,
      status: 'active',
    },
    // level 5
    {
      id: 'westmint-rpc',
      chainId: 'westmint',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'collectives-westend-rpc',
      chainId: 'collectives-westend',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'statemine-rpc',
      chainId: 'statemine',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'bridgehub-kusama-rpc',
      chainId: 'bridgehub-kusama',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'encointer-kusama-rpc',
      chainId: 'encointer-kusama',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'statemint-rpc',
      chainId: 'statemint',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
    {
      id: 'collectives-polkadot-rpc',
      chainId: 'collectives-polkadot',
      type: 'rpc',
      membershipLevelId: 5,
      status: 'active',
    },
  ])
}

async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('service', null, {})
}

module.exports = { up, down }
