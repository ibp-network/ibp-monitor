# DOTSAMA IBP - network of members

## some ideas on how peers can communicate in a decentralised manner

- libp2p is the backbone
- gossipsub propagates messages to all peers
- each peer can keep copies of state, as needed

## getting started
(Tested on node 16)
```
git clone https://github.com/dotsama-ibp/dotsama-ibp
cd dotsama-ibp/gossip
npm install
cat 'const configLocal = {}\n export { configLocal }' > config.local.js
node server.js
```

## TODO, progress

- ~~how to create your own peerId~~ - done, the server will create `keys/peerId.json` at 1st startup
- ~~peers should sign status updates~~ - this is configured in `libp2p.pubsub.signMessages: true`
- ~~implement dataStore~~ - done, sqlite default, mysql tested
- implement status / metrics - in progress
- implememt scoring
- implement prometheus (or similar) api
