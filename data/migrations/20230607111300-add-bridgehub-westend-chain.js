async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert('chain', [
    {
      id: 'bridgehub-westend',
      genesisHash: '0441383e31d1266a92b4cb2ddd4c2e3661ac476996db7e5844c52433b81fe782',
      name: 'Bridge Hub Westend',
      relayChainId: 'westend',
      logoUrl: 'https://parachains.info/images/parachains/1677333524_bridgehub_new.svg',
    },
  ])
}

async function down({ context: queryInterface }) {
  // no-op
}

export { up, down }
