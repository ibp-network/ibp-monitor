# DOTSAMA IBP - network of members

## some ideas on how peers can communicate in a decentralised manner

- libp2p is the backbone
- gossipsub propagates messages to all peers
- each peer can keep copies of state, as needed

## getting started
(Tested on node 16)
```bash
git clone https://github.com/dotsama-ibp/dotsama-ibp
cd dotsama-ibp/monitor
npm install
cat 'const configLocal = {}\n export { configLocal }' > config.local.js
# edit config.local.js to suit your needs
# create the datastore
node createDatastore.js
# run the server
node server.js
```
## building the UI (Vue SPA)
```bash
cd vue-spa
npm install
# if you get errors for lint, run `npm install --force`
npm run build
# output should update/overwrite the `../static` directory
```

## Docker

```bash
# create the docker image
docker build -t metaspan/ibp-monitor .

# run the image - test
docker compose up

# run the image - detach
docker compose up -d
```

## pm2

Install pm2 via https://pm2.keymetrics.io/docs/usage/quick-start/

```bash
cd dotsama-ibp/monitor
pm2 start --name ibp-monitor server.js
# optional
pm2 save # to persist your jobs
pm2 list # see the running jobs
pm2 logs ibp-monitor
```

## Managing the datastore

SQLite cli is available here:
- https://sqlite.org/download.html

For x86_64, you need to download the tar.gz and compile
```bash
wget https://sqlite.org/2022/sqlite-autoconf-3400000.tar.gz
tar -zf sqlite-autoconf-3400000.tar.gz
cd sqlite-autoconf-3400000
./configure
make
sudo mv sqlite3 /usr/local/bin
```

### Querying the datastore
```bash
cd monitor/data
sqlite datastore.sqlite "select * from monitor;"
```

## TODO, progress

- implememt scoring
- implement alerting
- ~~implement status / metrics~~ - some basic metrics available at /metrics/&lt;serviceUrl&gt;
- ~~implement prometheus (or similar) api~~ - done, each service has a link to the prometheus data
- ~~how to create your own peerId~~ - done, the server will create `keys/peerId.json` at 1st startup
- ~~peers should sign status updates~~ - this is configured in `libp2p.pubsub.signMessages: true`
- ~~implement dataStore~~ - done, sqlite default, mysql tested

## Kudos

- https://libp2p.io
- https://nodejs.org
- https://expressjs.com
- https://sqlite.org
- https://ejs.co
- https://sequelize.org
- https://www.chartjs.org
- https://momentjs.com
- vue.js
