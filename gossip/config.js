const config = {
  peerId: {
    // TODO: each member should register a known peerId
  },
  knownPeers: [
    // TODO: list all peers/members public keys...?
  ],
  listenPort: 0, // 0 for debugging 30000, // all nodes should listen on this port
  httpPort: 30001,
  allowedTopics: [
    '/ibp',
    '/ibp/services',
    '/ibp/healthCheck'
  ],
  updateInterval: 30 * 1000, // 60 seconds
  bootstrapPeers: [
    "/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu",
  ],
  services: [
    // Uncomment your services
    // {
    //   serviceId: 'dotters/kusama/1',
    //   peer: '12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh',
    //   name: "Kusama",
    //   chain: "kusama",
    //   url: "wss://rpc.dotters.network/kusama"
    // },
    // {
    //   serviceId: 'dotters/polkadot/1',
    //   name: "Dotters Polkadot",
    //   chain: "polkadot",
    //   url: "wss://rpc.dotters.network/polkadot"
    // },
    // {
    //   serviceId: 'dotters/westend/1',
    //   name: "Dotters Westend",
    //   chain: "westend",
    //   url: "wss://rpc.dotters.network/westend"
    // },
    {
      serviceId: 'metaspan/kusama/1',
      name: "Kusama",
      chain: "kusama",
      url: "wss://kusama-rpc.metaspan.io/ws"
    },
    // these are internal, don't publish internal services !
    // {
    //   serviceId: 'metaspan/kusama/1',
    //   name: "Kusama",
    //   chain: "kusama",
    //   url: "ws://192.168.0.85:40225"
    // },
    // {
    //   serviceId: 'metaspan/kusama/3',
    //   name: "Kusama",
    //   chain: "kusama",
    //   url: "ws://192.168.1.92:40425"
    // },
    // {
    //   serviceId: 'metaspan/polkadot/1',
    //   name: "Polkadot",
    //   chain: "polkadot",
    //   url: "ws://192.168.1.92:30325"
    // }
  ]
}

export { config }
