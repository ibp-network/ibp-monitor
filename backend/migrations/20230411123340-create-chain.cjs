// import { chainModel } from '../models/chain.js'

async function up(queryInterface, Sequelize) {
  await queryInterface
    // .createTable('chain', chainModel.definition)
    .sequelize.query('CREATE TABLE `chain` ( \
      `id` varchar(64) NOT NULL, \
      `genesisHash` varchar(64) NOT NULL, \
      `name` varchar(64) NOT NULL, \
      `relayChainId` varchar(64) DEFAULT NULL, \
      `logoUrl` varchar(256) DEFAULT NULL, \
      `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
      PRIMARY KEY (`id`) \
    )')
    .then(() =>
      queryInterface.addConstraint('chain', {
        type: 'FOREIGN KEY',
        name: 'fk_chain_relay_chain',
        fields: ['relayChainId'],
        references: {
          table: 'chain',
          field: 'id',
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      })
    )
    .then(() =>
      queryInterface.addConstraint('chain', {
        type: 'UNIQUE',
        name: 'u_chain_name',
        fields: ['name'],
      })
    )
    .then(() =>
      queryInterface.addConstraint('chain', {
        type: 'UNIQUE',
        name: 'u_chain_genesis_hash',
        fields: ['genesisHash'],
      })
    )
}

async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chain')
}

module.exports = { up, down }
