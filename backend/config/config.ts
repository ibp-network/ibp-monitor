import './dotenv.js';
// TODO sync this with dot-env
const P2P_PORT = process.env.P2P_PORT || 30000; // 0 for development/debugging, 30000 for deployment
const HTTP_PORT = process.env.HTTP_PORT || 30001;

export default {
  name: '🌐 metaspan-dev',
  dateTimeFormat: process.env.DATE_TIME_FORMAT, // 'DD/MM/YYYY HH:mm',
  sequelize: {
    database: process.env.DB_NAME,       // 'ibp_monitor_v02',
    username: process.env.DB_USERNAME,   // 'ibp_monitor',
    password: process.env.DB_PASSWORD,   // 'ibp_monitor',
    dialect: process.env.DB_DIALECT,     // 'mariadb',
    options: {
      // hostname = docker service name
      host: process.env.DB_HOST,           // 'ibp-datastore',
      port: parseInt(process.env.DB_PORT), // 3307,
      logging: process.env.DB_LOGGING === 'true', // .env only has string, e.g.: 'false',
    },
  },
  httpPort: HTTP_PORT,
  libp2p: {
    tcpPort: P2P_PORT,
    allowedTopics: [
      '/ibp',
      '/ibp/announce', // announce new peer with metadata
      '/ibp/services', // @deprecated
      '/ibp/healthCheck',
      '/ibp/signedMessage',
    ],
    bootstrapPeers: [
      '/ip4/192.168.1.23/tcp/30000/p2p/12D3KooWJnBHoi5vkwZroNXSvdqjCWDa3f4HJojAGGn5jDXcUj2h',
      // metaspan:dns
      '/dns4/ibp-monitor.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
      // helikon:ip4
      // '/ip4/78.181.100.160/tcp/30000/p2p/12D3KooWFZzcMsKumdpNyTKtivcGPukPfQAtCaW5o8qinFzSzHuf',
      '/ip4/78.181.100.160/tcp/30000/p2p/12D3KooWSQJWsaxHiMqxBXxBrbMm7fx7KEMdjWGpikxMM8H5FeDG',
      // helikon:dns
      // '/dnsaddr/ibp-monitor.helikon.io/tcp/30000/p2p/12D3KooWFZzcMsKumdpNyTKtivcGPukPfQAtCaW5o8qinFzSzHuf', // wrong peerId
      '/dns4/ibp-monitor.helikon.io/tcp/30000/p2p/12D3KooWSQJWsaxHiMqxBXxBrbMm7fx7KEMdjWGpikxMM8H5FeDG',
      // turboflakes:dns
      '/dns4/ibp-monitor.turboflakes.io/tcp/30000/p2p/12D3KooWQv2KCogXS3qmJL1ND1gPMzmRwiGAtEAEsMSMmW4G9L4c',
    ],
    gossipResults: true,
    relay: null,
  },
  // Worker Config
  workers: {
    apiKey: process.env.WORKER_API_KEY, // '123123123',
  },
  updateInterval: 5 * 60 * 1000, // 5 mins, as milliseconds
  pruning: {
    age: 90 * 24 * 60 * 60, // 90 days as seconds
    interval: 1 * 60 * 60, // 1 hour as seconds
  },
};
