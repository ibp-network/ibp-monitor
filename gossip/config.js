const config = {
  peerId: {
    // TODO: each member should register a known peerId
  },
  knownPeers: [
    // TODO: list all peers/members public keys...?
  ],
  listenPort: 0, // 0 for debugging 30000, // all nodes should listen on this port
  allowedTopics: ['/ibp', '/ibp/healthCheck'],
  updateInterval: 5000,
  bootstrapPeers: [
  //     "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa"
  ],
  services: [
    {
      serviceId: 'metaspan/kusama/1',
      name: "Kusama",
      chain: "kusama",
      url: "ws://192.168.1.92:40425"
    },
    {
      serviceId: 'metaspan/polkadot/1',
      name: "Polkadot",
      chain: "polkadot",
      url: "ws://192.168.1.92:30325"
    }
  ]
}

export { config }
