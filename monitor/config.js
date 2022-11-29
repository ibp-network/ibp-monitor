
const GOSSIP_PORT = 30000 // 0 for development/debugging, 30000 for deployment
// TODO work out an option for externalIp
const EXTERNAL_IP = '8.8.8.8'

// you can overwrite this in config.local.js

const config = {
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  sequelize: {
    databasename: '',
    username: '',
    password: '',
    options: {
      dialect: 'sqlite',
      storage: './data/datastore.sqlite',
      logging: false
    }
  },
  peerId: {
    // TODO: each member should register a known peerId
  },
  knownPeers: [
    // TODO: list all peers/members public keys...?
  ],
  listenPort: GOSSIP_PORT,
  // TODO: how to do this through NAT?
  // 0.0.0.0 will bind all interfaces
  externalIp: '0.0.0.0',
  multiAddr: [
    `/ip4/0.0.0.0/tcp/${GOSSIP_PORT}`
  ],
  httpPort: 30001,
  allowedTopics: [
    '/ibp',
    '/ibp/services',
    '/ibp/healthCheck'
  ],
  updateInterval: 30 * 1000, // 60 seconds
  bootstrapPeers: [
    // "/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu",
    "/ip4/192.96.202.185/tcp/30000/p2p/12D3KooWPB6XJ32wDMRpSn7djX5uPpCrjeFg6c2hmh9uDRmsuRbw",
  ],
  checkOwnServices: false,
  services: [
    // put these in your config.local.js
  ]
}

export { config }
