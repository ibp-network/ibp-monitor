# IBP Monitor - network of members

## Architecture / Components

- BullMQ + Redis - in-memory and persistent storage
- Datastore (Sequelize => MariaDB, PostgreSQL, MySQL etc)
- P2P server
- Workers - do the service health checks and other tasks
- API - provides http services at `/api`
- Frontend - serves the web application

## Getting Started

Clone the repository:

```bash
git clone https://github.com/ibp-network/ibp-monitor.git
cd ibp-monitor
```

## Configuration

Under the `docker ` folder, Rename `.env.sample` file to `.env`, and edit `P2P_PUBLIC_HOST` and/or `P2P_PUBLIC_IP` variables.
These are going to be used to announce your monitor node's public address, so that it can connect with the other monitor nodes on the network.
You may leave both commented out, or include any or both.

```bash
mv .env.sample .env
nano .env
# edit values as necessary
```

Rest of the default configuration is in `config/config.js`. Make a copy of the file, and edit the necessary items:
```
cp config.js config.local.js
```

Any item changed in `config/config.local.js` will override the default value in `config/config.js`

For details of the config items, please refer [CONFIG.md](./CONFIG.md)

## Default Ports

- 3000 - BullMQ admin, HTTP
- 3306 - MariaDB, TCP
- 6379 - Redis, TCP
- 30000 - libp2p, gossip, TCP <= proxy this port TCP
- 30001 - Frontend, HTTP <= proxy this port via SSL
- 30002 - API, HTTP

## Datastore

The database abstraction layer is powered by [Sequelize](https://sequelize.org). The default datastore is MariaDB, supported DBs are:

- [MySQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mysql)
- [MariaDB](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mariadb)
- [PostgreSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)
- [MSSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mssql)
- [Oracle Database](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#oracle-database)

Notes:

- SQLite is not supported by the IBP stack because the separate components need concurrent access to the database.
- If you chose another database you need to create your own installation or Docker container, and amend the `./config/config.local.js` with appropriate DB connection details.

## Initialise the datastore

After you make the necessary edits in `config/config.local.js` for your choice of database, you can use the following commands to install the necessary dependencies and run the migrations:

```bash
cd data
node migrate.js
```

If you instead choose to run the IBP stack using Docker Compose, the `ibp-datastore-init` job defined in `docker/docker-compose.yml` will initialise the database using Sequelize migration definitions under `data/migrations`, which use the data model definitions under `data/models`.

# Manual / Development

- requirements
  - Redis server
  - MariaDB / MySQL / PostgreSQL server
  - NodeJS@18 (higher version doesn't work correctly)
  - hosts file (optional)
- edit the hosts file & `config.local.js` as needed

## Hosts file (for development)

Inside Docker, the components can access each other by hostnames. When developing locally, you need to edit `config/config.local.js` file to define the ports, or set `/etc/hosts` as follows:

```
127.0.0.1 ibp-redis
127.0.0.1 ibp-datastore
127.0.0.1 ibp-monitor-api
```

If you don't have Redis or MariaDB installed, you can start these individually & manually via Docker. See below for more info.

## Starting each component manually

Clone the repository and install the dependencies:

```bash
git clone https://github.com/ibp-network/ibp-monitor.git
cd ibp-monitor
npm install
```

Each component requires a separate shell window.

1. **Redis & MariaDB**

	See Docker section if you don't have these running locally, or, amend the config to point to your local services.
   
2. **API**

    ```bash
    node api.js
    ```

3. **P2P Server**

	```bash
	node server.js
	```

4. **Front End (static)**
   
   See Docker, this will launch on `http://localhost:30001`.

	```bash
	cd frontend
	npm install
	npm run build # target files will populate ./static
	```

5. **Front End (developer mode)**
   
	In developer mode the frontend will proxy `/api` to the API service. See `./vue-	spa/vite.config.js` if you need to amend this.
   Note, in production mode the `/api` location is proxied by nginx to the `ibp-monitor-api` service.

	```bash
	cd frontend
	npm install
	npm run serve
	```

6. **BullMQ**
   See `http://localhost:3000/admin/queues`

	```bash
	node workers.js
	```

## PM2

As above, each node.js component can run separately in PM2. (Requires MariaDB and Redis)

```bash
pm2 start --name ibp-monitor-api api.js
pm2 start --name ibp-monitor-p2p server.js
pm2 start --name ibp-monitor-workders workers.js
```

## Serving the frontend apache/nginx

The frontend is located in the `./frontend/static` folder. See development above for building the folder contents.

Point Apache or nginx to serve this folder, with the following config (nginx example):

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

- ibp-redis
- ibp-datastore
- ibp-datastore-init
- ibp-monitor-api
- ibp-monitor-server
- ibp-monitor-workers
- ibp-monitor-frontend

### Edit the .env file

Under the `docker ` folder, Rename `.env.sample` file to `.env`, and edit `P2P_PUBLIC_HOST` and/or `P2P_PUBLIC_IP` variables.
These are going to be used to announce your monitor node's public address, so that it can connect with the other monitor nodes on the network.
You may leave both commented out, or include any or both.

```bash
mv .env.sample .env
nano .env
# edit values as necessary
```

### Start all services

```bash
cd docker # you need to be in the docker directory!
docker compose up
```

Use `ctrl-c` to stop services.

Use `-d` flag with compose (`docker compose up -d`) for detach to let the services run in background.

#### Start individual services

```bash
cd docker # you need to be in the docker directory!
docker compose up <service name> # optional `-d` flag
```

## Getting started

(Tested on Node v16)

```bash
git clone https://github.com/ibp-network/ibp-monitor.git
cd  ibp-monitor
npm install
cd config
# edit config.local.js to suit your needs
cp config.js config.local.js
# initialise the datastore
cd data
node migrate.js
cd ..
# run the server
node server.js
# run the workers
node workers.js
# run the API
node api.js
# run the frontend
cd frontend
npm install
npm run dev
```

### optional

```
pm2 save  # to persist your jobs
pm2 list  # see the running jobs
pm2 logs  ibp-monitor
```

## TODO

- Implememt scoring

- Implement alerting

- ~~implement status / metrics~~ - some basic metrics available at `/api/metrics/{serviceId}`.

- ~~implement prometheus (or similar) api~~ - Done, each service has a link to the Prometheus data.

- ~~how to create your own peerId~~ - Done, the server will create `keys/peer-id.json` at 1st startup.

- ~~Peers should sign status updates~~ - This is configured in `libp2p.pubsub.signMessages: true`.

## Kudos

- [libp2p](https://libp2p.io)
- [NodeJS](https://nodejs.org)
- [ExpressJS](https://expressjs.com)
- [Sequelize](https://sequelize.org)
- [ChartJS](https://www.chartjs.org)
- [MomentJS](https://momentjs.com)
- [VueJS](https://vuejs.org)
