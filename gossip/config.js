const config = {
  peerId: {
    // TODO: each member should register a known peerId
  },
  knownPeers: [
    // TODO: list all peers/members public keys...?
  ],
  listenPort: 0, // 0 for debugging 30000, // all nodes should listen on this port
  allowedTopics: ['/ibp', '/ibp/healthCheck'],
  updateInterval: 30000, // 30 seconds
  bootstrapPeers: [
    "/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu",
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
