
# IBP Monitor - network of members


## Architecture / Components  
- frontend - serves the vue-spa
- api - provides http services at `/api`
- datastore (sequelize => mariadb, postgres, mysql etc)
- p2p server
- workers
- bullmq + redis

# Getting Started

Clone the repo
```bash
git clone https://github.com/dotsama-ibp/dotsama-ibp
cd dotsama-ibp/monitor
```

# Configuration

Default config is provided in `config/config.js`.
An empty `config/config.local.js` is provided. You can edit `config/config.local.js`, to override the default config.
For details of the config items, please refer [CONFIG.md](./CONFIG.md)

## Ports

- 3000 - bullmq admin, http
- 3306 - mariadb, tcp
- 6379 - redis, tcp
- 30000 - libp2p, gossip, tcp <= proxy this port tcp
- 30001 - frontend, http <= proxy this port via ssl
- 30002 - api, http

# Datastore

The database abstraction layer is sequelize.org. The default datastore is MariaDB, supported DBs are:
-   [MySQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mysql)
-   [MariaDB](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mariadb)
-   [PostgreSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)
-   [MSSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mssql)
-   [Oracle Database](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#oracle-database)

Notes:
- SQLite is not supported. We need concurrent access to the database.
- if you chose another database you need to create your own installation / docker container, and amend the `./config/config.local.js` with appropriate DB connection details.

## Initialise the datastore

Manually, run the ./data/schema.mysql.sql script
Or (after editing the `config/config.local.js` file)
```bash
node createDatastore.js
```

# Manual / Development

- requirements
  - hosts file
  - redis server
  - mariadb / mysql server
- edit the hosts file & config.local.js as needed

## Hosts file (for development)
Inside Docker, the components can access each other by hostnames. When developing locally, you need to edit `config/config.local.js` file, or set /etc/hosts as follows:
```
127.0.0.1 ibp-redis
127.0.0.1 ibp-datastore
127.0.0.1 ibp-monitor-api
```
If you don't have redis or mariadb installed, you can start these individually & manually via Docker. See below for more info.

## Starting each component manually
Each component requires a separate shell window.
1. **redis & mariadb**
See Docker section of you don't have these running locally
Or, amend the config to point to your local services
2. **ibp-monitor-api**
```bash
node api.js
```
3. **ibp-monitor (p2p server)**
```bash
node server.js
```
4. **ibp-monitor-frontend** (static)
see Docker, this will launch on `http://localhost:30001`
Building the frontend for production
```bash
cd vue-spa
npm install
npm run build # target files will populate ../static
```
5. **ibp-monitor-frontend** (developer mode)
See http://localhost:8080
In developer mode the frontend will proxy `/api` to the api service. See `./vue-spa/vue.config.js` if you need to amend this.
Note, in production mode the `/api` location is proxied by nginx to the `ibp-monitor-api` service.
```bash
cd vue-spa
npm install
npm run serve
```

6. **ibp-bullmq**
See http://localhost:3000/admin/queues
```bash
node workers.js
```

## PM2
As above, each node.js component can run separately in PM2. (Requires mariadb and redis)
```bash
pm2 start --name ibp-monitor-api api.js
pm2 start --name ibp-monitor-p2p server.js
pm2 start --name ibp-monitor-workders workers.js
```

## Serving the frontend apache/nginx
The frontend is located in the ./static folder
See development above for building the ./static folder contents
Point apache or nginx to serve this folder, with the following config (nginx example):
```nginx
server {
  listen 80;
  server_name ibp-monitor.metaspan.io;
  location /api {
    # to preserve the url encoding, don't put the /api on the end
    proxy_pass http://ibp-monitor-api:30002;
  }
  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
  error_page 500 502 503 504 /50x.html;
  location = /50x.html {
  root /usr/share/nginx/html;
}
```

# Docker 

Docker files and `docker-compose.yml` are in the `./docker` folder. Service names:
- ibp-monitor-frontend
- ibp-monitor-api
- ibp-monitor
- ibp-datastore
- redis
- bullmq


## Start all services
```bash
cd docker # you need to be in the docker directory!
docker compose up
```
`ctrl-c` to stop services
Use `-d` flag with compose for detach to let them run in background

#### Start individual services
```bash
cd docker # you need to be in the docker directory!
docker compose up <service name> # optional `-d` flag
```


  

## getting started

(Tested on node 16)

```bash

git clone  https://github.com/dotsama-ibp/dotsama-ibp
cd  dotsama-ibp/monitor
npm install
echo  'const configLocal = {}\n export { configLocal }' > config.local.js
# edit config.local.js to suit your needs
# create the datastore
node createDatastore.js
# run the server
node server.js
```
  



# optional

pm2 save  # to persist your jobs

pm2 list  # see the running jobs

pm2 logs  ibp-monitor

```

  

## Managing the datastore

```


  

## TODO, progress

  

- implememt scoring

- implement alerting

-  ~~implement status / metrics~~ - some basic metrics available at /metrics/&lt;serviceUrl&gt;

-  ~~implement prometheus (or similar) api~~ - done, each service has a link to the prometheus data

-  ~~how to create your own peerId~~ - done, the server will create `keys/peerId.json` at 1st startup

-  ~~peers should sign status updates~~ - this is configured in `libp2p.pubsub.signMessages: true`
 

## Kudos

- https://libp2p.io
- https://nodejs.org
- https://expressjs.com
- https://sequelize.org
- https://www.chartjs.org
- https://momentjs.com
- vue.js
