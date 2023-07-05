async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('chain', [
    {
      id: 'westend',
      genesisHash: 'e143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      name: 'Westend',
      relayChainId: null,
      logoUrl: null,
    },
    {
      id: 'kusama',
      genesisHash: 'b0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      name: 'Kusama',
      relayChainId: null,
      logoUrl: 'https://parachains.info/images/kusama.png',
    },
    {
      id: 'polkadot',
      genesisHash: '91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      name: 'Polkadot',
      relayChainId: null,
      logoUrl: 'https://parachains.info/images/polkadot.png',
    },
    {
      id: 'westmint',
      genesisHash: '67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9',
      name: 'Westmint',
      relayChainId: 'westend',
      logoUrl: 'https://parachains.info/images/parachains/1623939400_statemine_logo.png',
    },
    {
      id: 'collectives-westend',
      genesisHash: '713daf193a6301583ff467be736da27ef0a72711b248927ba413f573d2b38e44',
      name: 'Collectives Westend',
      relayChainId: 'westend',
      logoUrl: 'https://parachains.info/images/parachains/1664976722_collectives_logo.png',
    },
    {
      id: 'statemine',
      genesisHash: '48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
      name: 'Statemine',
      relayChainId: 'kusama',
      logoUrl: 'https://parachains.info/images/parachains/1623939400_statemine_logo.png',
    },
    {
      id: 'bridgehub-kusama',
      genesisHash: '00dcb981df86429de8bbacf9803401f09485366c44efbf53af9ecfab03adc7e5',
      name: 'Bridge Hub Kusama',
      relayChainId: 'kusama',
      logoUrl: 'https://parachains.info/images/parachains/1677333455_bridgehub_kusama.svg',
    },
    {
      id: 'encointer-kusama',
      genesisHash: '7dd99936c1e9e6d1ce7d90eb6f33bea8393b4bf87677d675aa63c9cb3e8c5b5b',
      name: 'Encointer Kusama',
      relayChainId: 'kusama',
      logoUrl: 'https://parachains.info/images/parachains/1625163231_encointer_logo.png',
    },
    {
      id: 'statemint',
      genesisHash: '68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
      name: 'Statemint',
      relayChainId: 'polkadot',
      logoUrl: 'https://parachains.info/images/parachains/1623939400_statemine_logo.png',
    },
    {
      id: 'collectives-polkadot',
      genesisHash: '46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2',
      name: 'Collectives Polkadot',
      relayChainId: 'polkadot',
      logoUrl: 'https://parachains.info/images/parachains/1664976722_collectives_logo.png',
    },
    {
      id: 'bridgehub-polkadot',
      genesisHash: 'dcf691b5a3fbe24adc99ddc959c0561b973e329b1aef4c4b22e7bb2ddecb4464',
      name: 'Bridge Hub Polkadot',
      relayChainId: 'polkadot',
      logoUrl: 'https://parachains.info/images/parachains/1677333524_bridgehub_new.svg',
    },
  ])
}

async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('chain', null, {})
}

module.exports = { up, down }
