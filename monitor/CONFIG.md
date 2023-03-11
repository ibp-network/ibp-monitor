
# How to configure the monitor

1. copy config.js to config.local.js

  - Do not modify config.js, this could prevent you from pulling updates from github

2. edit the config.local.js as needed

## A note on `peerId`

The `monitor` uses libp2p to connect with other monitor peers.
At 1st startup, each monitor will generate a peerId (saved here: `keys/peerId.json`)

The local monitorId (peerId) is printed to console at startup:

```bash 
Our monitorId 12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh
```

**!!! use this monitorId (peerId) in the `listen.announce` section below.**

Example:
```json
{
  "id":"12D3KooWH1XvGgPjRoMLi4tykATZ8UUcKng8sRU8WcmftoW1ZvJh",
  "privKey":" !!! this is secret !!! ",
  "pubKey":"CAESIGreOOZaUhD6MAOysTOZsk4FyAZQVKFCIXkKUnkm8Q2W"
}
```

This peerId is used to sign `gossip` messages. On receipt of a `gossip` message, we validate the signature of the sender.

## Example config.local.js file

### ports for NAT & firewall config
```js
const GOSSIP_PORT = 30000
const HTTP_PORT = 30001
```

### Timezone & DateTime format
Configure the timezone for your server.
Sequelize will always store dates in UTC.
The web UI will display dates / timestamps in this dateTimeFormat
```js
  timezone: 'Europe/London',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
```

### Datastore config
- https://sequelize.org/docs/v6/getting-started/

Ex: SQLite
```js
  sequelize: {
    databasename: '',
    username: '',
    password: '',
    options: {
      dialect: 'sqlite',
      storage: './data/datastore.sqlite',
      logging: false // log SQL statements to console
    }
  }
```

Ex: MySQL
```js
  sequelize: {
    database: 'ibp_dev',
    username: 'ibp_dev',
    password: 'ibp_dev',
    options: {
      dialect: 'mysql',
      dialectOptions: {
        // Your mysql2 options here
        host: '192.168.1.200',
        port: '3306'
      },
      logging: false, // console.log // logging fn
    }
  },
```

### listen port
The port for libp2p
```js
  listenPort: GOSSIP_PORT,
```

### addresses
Note: if you have `addresses` section in your local config, you need to provide `listen` and, optionally `announce` sections.

- `addresses`
  - ``/ip4/0.0.0.0/tcp/${GOSSIP_PORT}`` should be sufficient. The other monitor nodes are not listening on any other protocol

- `announce` - use this to announce your external IP address or hostname; examples:
  - `'/ip4/192.96.202.185/tcp/30000/p2p/\<peerId>'` - 
  - `'/dnsaddr/ibp-bootstrap.metaspan.io/tcp/30000/p2p/\<peerId>'`

You can announce on any external facing port, then NAT that port to your internal GOSSIP_PORT
\
You only need TCP on the external ports.

```js
  addresses: {
    listen: [
      `/ip4/0.0.0.0/tcp/${GOSSIP_PORT}`
    ],
    // announce: []
  },
```

### httpPort
You can access the web UI on this port. (You can also NAT web traffic to this port as needed)
```js
  httpPort: HTTP_PORT,
```

### Update interval
How often your monitor service should healthCheck the services of its peers (5 mins is often enough). We don't want to operate a spambot network!
```js
  updateInterval: 5 * 60 * 1000, // 5 mins, in milliseconds
```

### Services

Advertise your services here! Peers (other monitors) will use this list to run healthChecks and gossip performance to the network
By default, you check the services of your peers. If you also want to check your own services, amend `checkOwnServices`
```js
  checkOwnServices: false,
  services: [
  // {
  //   name: "Metaspan Kusama",
  //   chain: "kusama",
  //   serviceUrl: "wss://kusama-rpc.metaspan.io/ws"
  // },
  ],
```

### Datastore Pruning
```js
  pruning: {
    age: 90 * 24 * 60 * 60, // 90 days as seconds
    interval: 1 * 60 * 60 // 1 hour as seconds
  },
```

### Allowed Topics
This section should not be changed unless you know what you're doing with libp2p. Better just to exclude it from your config.local.js
```js
  // allowedTopics: [
  //   '/ibp',
  //   '/ibp/services',
  //   '/ibp/healthCheck'
  // ],
```

### Bootstrap peers
In p2p we need to find our peers to form a network. The bootstrap peers provides a starting point.
Normally you don't need to change this
```js
  // bootstrapPeers: [
  //   "/dnsaddr/boot.metaspan.io/tcp/30000/p2p/12D3KooWK88CwRP1eHSoHheuQbXFcQrQMni2cgVDmB8bu9NtaqVu",
  // ],
```

### SLA
TBC
```js
  performance: {
    sla: 500 // ms - used for performance graph, and later for alerts
  }
```