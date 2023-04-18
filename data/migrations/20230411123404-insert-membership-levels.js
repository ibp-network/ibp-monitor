async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert('membership_level', [
    {
      id: 1,
      name: 'Professional 1',
      subdomain: 'rpc',
    },
    {
      id: 2,
      name: 'Professional 2',
      subdomain: 'rpc',
    },
    {
      id: 3,
      name: 'Professional 3',
      subdomain: 'rpc',
    },
    {
      id: 4,
      name: 'Professional 4',
      subdomain: 'rpc',
    },
    {
      id: 5,
      name: 'Professional 5',
      subdomain: 'sys',
    },
    {
      id: 6,
      name: 'Professional 6',
      subdomain: 'sys',
    },
    {
      id: 7,
      name: 'Professional 7',
      subdomain: 'sys',
    },
    {
      id: 8,
      name: 'Professional 8',
      subdomain: 'sys',
    },
  ])
}

async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('membership_level', null, {})
}

export { up, down }
