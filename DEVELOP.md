

## Required

- mariadb (local or docker)
- npm
- yarn

### MariaDB



### NVM
https://github.com/nvm-sh/nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

### Node & NPM
```bash
npm install --global yarn
```

## Getting started

Fork the main repository and clone it locally.

```bash
# change this repo to match your fork
git clone https://github.com/metaspan/ibp-monitor/
cd ibp-monitor
```

### populate the database

```bash
# TODO
```

### Start the backend

```bash
cd ../backend
npm install
npm run start:dev
```

The backend will be available at http://localhost:4000, serving the static files from the `./frontend/build` folder.

### Build the frontend

```bash
cd frontend
yarn install
yarn build
# the output is in the `./build` folder
# the backend will serve it from there
```

### Developing the frontend

```bash
cd frontend
yarn install
yarn dev
```

The frontend will be available at http://localhost:????, proxying the api calls to backend at http://localhost:30001.
