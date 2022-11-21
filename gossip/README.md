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
node server.js
```

## TODO

- how to create your own peerId
- peers should sign status updates
- implement status / metrics
- implement dataStore
- implememt scoring
- implement prometheus (or similar) api
