# Development Notes

## Configuration

Read the ./CONFIG.md file for more information on configuration.
Configuration files are found in `./config`

**DO NOT CHEK IN YOUR LOCAL CONFIG !!**

## Database

The database is a MariaDB instance found in `./data`
Any Sequalize supported database can be used (in theory). We develop and test with MariaDB. If you find any issues with other databases, please open an issue on github.

## Frontend

The frontend is a Vuetify SPA (single-page app) found in `./frontend`

## Backend

The backend is a nest.js app found in `./backend`
- the backend hosts the following features:
  - libp2p gateway - used for peer communication
  - ws gateway - used for worker communication
  - /api controllers - used for frontend communication

## Keys

Each monitor node has a unique key (peerId). This key is used to identify the node on the network.
The keys are found in `./keys`.

At startup, if the ./keys/peer-id.json does not exist, a new key will be generated and saved to the folder.

**DO NOT CHECK IN THE KEYS TO GIT !!**

## Worker

The worker is a node.js app found in `./worker`
The worker does not have access to the database. It communicates with the backend via websockets.

## Running the application

For development it is easy to run the application directly on local machine.

- database
  - MariaDB listening on localhost port 3306
- backend
  - `npm run start:dev`
  - note: 
- frontend
  - `yarn dev`
- worker
  - `nodemon worker.js`

note: the components will automatically restart (hot reload) when files are changed

## PM2

As an alternative, you can also use PM2 to run the application and worker.

## Docker

Docker is the preferred method of running the application for production.

Configuration is found in the `./docker` folder.
