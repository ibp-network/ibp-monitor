import { chainModel } from '../models/chain.js'

async function up({ context: queryInterface }) {
  await queryInterface
    // .createTable('chain', chainModel.definition_v0)
    .sequelize.query('CREATE TABLE `chain` ( \
      `id` varchar(64) NOT NULL, \
      `genesisHash` varchar(64) NOT NULL, \
      `name` varchar(64) NOT NULL, \
      `relayChainId` varchar(64) DEFAULT NULL, \
      `logoUrl` varchar(256) DEFAULT NULL, \
      `createdAt` datetime NOT NULL DEFAULT current_timestamp(), \
      PRIMARY KEY (`id`) \
    )')
    // KEY `fk_chain_relay_chain` (`relayChainId`) \
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
    // UNIQUE KEY `u_chain_name` (`name`), \
    .then(() =>
      queryInterface.addConstraint('chain', {
        type: 'UNIQUE',
        name: 'u_chain_name',
        fields: ['name'],
      })
    )
    // UNIQUE KEY `u_chain_genesis_hash` (`genesisHash`), \
    .then(() =>
      queryInterface.addConstraint('chain', {
        type: 'UNIQUE',
        name: 'u_chain_genesis_hash',
        fields: ['genesisHash'],
      })
    )
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('chain')
}

export { up, down }
