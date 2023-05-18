

builing the docker images

## Configure docker (desktop)

Settings > Docker Engine : Add insecure registries:
```json
{
  "insecure-registries": ["192.168.1.2:5002"]
}
```

## Build & deploy process
```bash
# docker login -u docker -p d0ck3r localhost:5050
REGISTRY=docker.metaspan.io
docker login -u docker -p d0ck3r ${REGISTRY}

# https://stackoverflow.com/questions/53416685/docker-compose-tagging-and-pushing

COMPOSE_DOCKER_CLI_BUILD=1
DOCKER_BUILDKIT=1
# if building on mac, set this to linux/amd64
DOCKER_DEFAULT_PLATFORM=linux/amd64
# docker-compose build

docker compose build # --pull # if you want to pull the latest images
docker compose push
docker compose buildx build --pull --push


## Services to build

- ibp-redis
docker compose buildx build --platform linux/amd64 -t ${REGISTRY}/ibp/ibp-redis -f Dockerfile.ibp.services --push ../.

- ibp-datastore
- ibp-datastore-init
- ibp-monitor-api
- ibp-monitor-server
- ibp-monitor-workers
- ibp-monitor-frontend



# these can't be run together
# --load: load the image locally, this should make subsequent builds faster
# --push: push the image to the registry

docker buildx build --platform linux/amd64 -t ${REGISTRY}/ibp/subledgr-api -f Dockerfile.ibp.services --push ../.
# docker build --platform linux/amd64 -t ${REGISTRY}/subledgr/subledgr-api -f Dockerfile.api --push ../.
# docker tag subledgr/subledgr-api ${REGISTRY}/subledgr/subledgr-api
# docker push ${REGISTRY}/subledgr/subledgr-api

docker buildx build --platform linux/amd64 -t ${REGISTRY}/subledgr/subledgr-fe -f Dockerfile.frontend --push ../.
# docker tag subledgr/subledgr-fe ${REGISTRY}/subledgr/subledgr-fe
# docker push ${REGISTRY}/subledgr/subledgr-fe

# docker build --platform linux/amd64 -t subledgr/subledgr-datastore -f Dockerfile.postgres ../.
# docker tag subledgr/subledgr-datastore ${REGISTRY}/subledgr/subledgr-datastore
# docker push ${REGISTRY}/subledgr/subledgr-datastore

# Updates in portainer
# for each service (in the stack), open the service and 
# > Click Update the service
# > Select Re-pull image
# > Click Update
# Double-check the environment & secrets are still in place

```

## GraphQL Express
```bash
docker build -t subledgr-api -f Dockerfile.graphql-express ../
```

## Setup the local registry

https://www.blackvoid.club/private-docker-registry-with-portainer/

