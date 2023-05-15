const GOSSIP_PORT = 30000 // 0 for development/debugging, 30000 for deployment
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
      port: 3306,
      logging: false,
    },
  },
  redis: {
    // hostname = docker service name
    host: 'ibp-redis',
    port: 6379,
  },
  peerId: {
    // TODO: each member should register a known peerId
  },
  knownPeers: [
    // TODO: list all peers/members public keys...?
  ],
  httpPort: HTTP_PORT,
  listenPort: GOSSIP_PORT,
  allowedTopics: ['/ibp', '/ibp/services', '/ibp/healthCheck'],
  updateInterval: 5 * 60 * 1000, // 5 mins, as milliseconds
  bootstrapPeers: [
    '/ip4/31.22.13.147/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
    '/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
    '/ip4/78.181.100.160/tcp/30000/p2p/12D3KooWFZzcMsKumdpNyTKtivcGPukPfQAtCaW5o8qinFzSzHuf',
    '/dnsaddr/ibp-monitor.helikon.io/tcp/30000/p2p/12D3KooWFZzcMsKumdpNyTKtivcGPukPfQAtCaW5o8qinFzSzHuf',
    '/ip4/172.104.248.97/tcp/30000/p2p/12D3KooWQv2KCogXS3qmJL1ND1gPMzmRwiGAtEAEsMSMmW4G9L4c',
    '/dnsaddr/ibp-monitor.turboflakes.io/tcp/30000/p2p/12D3KooWQv2KCogXS3qmJL1ND1gPMzmRwiGAtEAEsMSMmW4G9L4c',
  ],
  checkOwnServices: false,
  checkOtherServices: true,
  gossipResults: true,
  relay: null,
  services: [
    // put these in your config.local.js
  ],
  pruning: {
    age: 90 * 24 * 60 * 60, // 90 days as seconds
    interval: 1 * 60 * 60, // 1 hour as seconds
  },
  performance: {
    sla: 500, // ms - used for performance graph, and later for alerts
  },
  alertsEngine: {
    enabled: false,
    queueName: 'alerts',
    webhook: 'http://ibp-abot:5001/api/v1/alerts',
    apiKey: 'alerts-bot-api-key',
    thresholds: {
      blockDrift: 20 // 20 blocks out of sync
    }
  }
}

export { config }
