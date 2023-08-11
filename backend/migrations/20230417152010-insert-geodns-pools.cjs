async function up(queryInterface, Sequelize) {
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

async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('geo_dns_pool', null, {})
}

module.exports = { up, down }
