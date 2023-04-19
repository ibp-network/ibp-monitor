# How to configure the monitor

1. Copy `config/config.js` to `config/config.local.js`
   Do not modify `config.js`, this could prevent you from pulling updates from github
2. Edit `config.local.js` as needed

## A note on `peerId`

The `monitor` uses `libp2p` to connect with other monitor peers. At 1st startup, each monitor will generate a peerId (saved as `keys/peerId.json`) The local monitor id (`peerId`) is printed to console at startup:

```bash
Our monitorId  12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh
```

**!!! use this monitorId (peerId) in the `listen.announce` section below.**
Example `keys/peerId.json`:

```json
{
  "id": "12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh",
  "privKey": " !!! this is secret !!! ",
  "pubKey": "CAESIGreOOZaUhD6MAOysTOZsk4FyAZQVKFCIXkKUnkm8Q2W"
}
```

This peerId is used to sign `gossip` messages. On receipt of a `gossip` message, we validate the signature of the sender.

# Example config.local.js file

WARNING: `config/config.local.js` potentially contains password and other sensitive info. This file is excluded in .gitignore. DO NOT CHECK THIS FILE IN!

```js
// TODO: check if this is useful? process.env.GOSSIP_PORT could be set in the Dockerfile?
const GOSSIP_PORT = 30000`
```

```js
// TODO: check if this is useful? process.env.HTTP_PORT could be set in the Dockerfile?
const HTTP_PORT = process.env.HTTP_PORT || 30001`
```

```js
// This is the dateTime format used on the user interface
dateTimeFormat: 'DD/MM/YYYY HH:mm',`
```

```js
// Connection to the datastore
sequelize: {
  database: 'ibp_monitor',
  username: 'ibp_monitor',
  password: 'ibp_monitor',
  options: {
    dialect: 'mariadb',
    // hostname = docker service name
    host: 'ibp-datastore',
    port: 3306,
    // optionally turn on Sequelize logs 
    logging: false,
  }
}
```

```js
// Connection to Redis
redis: {
  // hostname = docker service name
  host: 'ibp-redis',
  port: 6379
},
```

```js
// @deprecated: the peerId is calculated at 1st run
peerId: {
  // each member should register a known peerId
},
```

```js
// List of other monitors (peerId is printed on startup)
knownPeers: [
  // TODO: list all peers/members public keys...?
  // Not currently used.
],
// TODO: amend lib/MessageHandler to check `cfg.knownPeersOnly` when gossip messages.
knownPeersOnly: false,
```

```js
// http port for frontend
httpPort: HTTP_PORT,
```

```js
// tcp port for gossip
listenPort: GOSSIP_PORT,
```

```js
// config for libp2p
addresses: {
  listen: [
    '/ip4/0.0.0.0/tcp/${GOSSIP_PORT}',
    // `/ip4/0.0.0.0/tcp/${RTC_PORT}/http/p2p-webrtc-direct` // not used!
  ],
  announce: [
    // your monitor's external ip address, p2p port and peerId
    `/ip4/31.22.13.147/tcp/${GOSSIP_PORT}/p2p/12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh`,
  ]
},
```

```js
// allowed topics (channels) for the p2p protocol
allowedTopics: [
  // TBC
  '/ibp',
  // publish a list of services
  '/ibp/services',
  // publish a list of results
  '/ibp/healthCheck'
],
```

```js
// how often to advertise our services and perform healthchecks
updateInterval: 30 * 1000, // 30 seconds
```

```js
// where to find bootstrap peers (monitors)
bootstrapPeers: [
  '/ip4/31.22.13.147/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
  '/dnsaddr/boot.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu',
],
```

```js
// should we healthCheck our own services?
checkOwnServices: false,
```

```js
// should we healthCheck services of other monitors?
checkOtherServices: true,
```

```js
// send out results to p2p peers
gossipResults: true,
```

```js
// libp2p: allow our node to relay messages to other nodes
relay: null,
```

```js
// IMPORTANT
// these services will be advertised to other nodes
services: [
// put these in your config.local.js
  {
    serviceUrl: "wss://ibp-rpc.metaspan.io/westend",
    name: "Metaspan Westend RPC",
    chain: "westend",
  }
],
```

```js
// prune the datastore
pruning: {
  // age of message
  age: 90 * 24 * 60 * 60, // 90 days as seconds
  // how often to prune
  interval: 1 * 60 * 60  // 1 hour as seconds
},
```

```js
// not used: TODO, implement full SLA monitoring
performance: {
  sla: 500 // ms - used for performance graph, and later for alerts
}
```
