
const GOSSIP_PORT = 30000 // 0 for development/debugging, 30000 for deployment
//const RTC_PORT = 30002 // TODO remove this
// set HTTP_PORT in docker-compose.yml
const HTTP_PORT = process.env.HTTP_PORT || 30001

// you can overwrite this in config.local.js

const config = {
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  sequelize: {
    database: 'ibp_monitor',
    username: 'ibp_monitor',
    password: 'ibp_monitor',
    options: {
      dialect: 'mariadb',
      // hostname = docker service name
      host: 'ibp-datastore',
      port: 3306
    }
  },
  redis: {
    // hostname = docker service name
    host: 'ibp-redis',
    port: 6379
  },
  peerId: {
    // TODO: each member should register a known peerId
  },
  knownPeers: [
    // TODO: list all peers/members public keys...?
  ],
  httpPort: HTTP_PORT,
  listenPort: GOSSIP_PORT,
  // TODO: how to do this through NAT?
  // 0.0.0.0 will bind all interfaces
  addresses: {
    listen: [
      `/ip4/0.0.0.0/tcp/${GOSSIP_PORT}`,
      // `/ip4/0.0.0.0/tcp/${RTC_PORT}/http/p2p-webrtc-direct`
    ],
    // announce: []
  },
  allowedTopics: [
    '/ibp',
    '/ibp/services',
    '/ibp/healthCheck'
  ],
  updateInterval: 30 * 1000, // 30 seconds
  bootstrapPeers: [
    '/ip4/31.22.13.147/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
    '/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
  ],
  checkOwnServices: false,
  checkOtherServices: true,
  gossipResults: true,
  relay: {
    enabled: false
  },
  services: [
    // put these in your config.local.js
  ],
  pruning: {
    age: 90 * 24 * 60 * 60, // 90 days as seconds
    interval: 1 * 60 * 60 // 1 hour as seconds
  },
  performance: {
    sla: 500 // ms - used for performance graph, and later for alerts
  }
}

export { config }