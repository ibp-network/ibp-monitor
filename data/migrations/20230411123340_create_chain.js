import { chainModel } from '../models/chain.js'

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('chain', chainModel.definition)
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

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('chain')
}

export { up, down }
