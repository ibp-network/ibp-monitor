async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert('geo_dns_pool', [
    // level 1
    {
      name: 'Dotters',
      host: 'dotters.network',
    },
    {
      name: 'IBP',
      host: 'ibp.network',
    },
  ])
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('geo_dns_pool', null, {})
}

export { up, down }
