const { spawn } = require('child_process');
const split2 = require('split2');
// const moment = require('moment');

const ECHOLOG = false;

let relayChains = {
  polkadot: 'ws://192.168.1.92:30325',
  kusama: 'ws://192.168.1.92:40425',
  westend: 'ws://192.168.1.92:32015'
}

let chains = ['polkadot', 'kusama', 'westend']
let paraChains = {
  'statemint': 'polkadot',
  'collectives-polkadot': 'polkadot',
  // 'bridge-hub-polkadot': 'polkadot',
  'statemine': 'kusama',
  // 'collectives-kusama': 'kusama',
  'bridge-hub-kusama': 'kusama',
  'westmint': 'westend',
  'collectives-westend': 'westend',
  // 'bridge-hub-westend': 'westend',
  // 'encointer-polkadot': 'polkadot',
  'encointer-kusama': 'kusama',
  // 'encointer-westend': 'westend',
}

let commands = {
  polkadot: {
    exec: '/Users/derek/Sites/metaspan/paritytech/polkadot/target/release/polkadot', 
    params: '--chain ${CHAIN} --tmp --name IBP_Bootnode_Test --reserved-only --reserved-nodes ${ENDPOINT} --no-mdns --no-hardware-benchmarks'
  },
  // kusama: '/path/to/polkadot',
  // westend: '/path/to/polkadot',
  parachain: {
    exec: '/Users/derek/Sites/metaspan/paritytech/cumulus/target/release/polkadot-parachain',
    params: '--chain ${CHAIN} --tmp --reserved-only --reserved-nodes ${ENDPOINT} --no-mdns --no-hardware-benchmarks --relay-chain-rpc-urls ${RELAYCHAIN}'
  },
  encointer: {
    exec: '/Users/derek/Sites/metaspan/IBP/encointer-parachain/target/release/encointer-collator',
    params: '--chain encointer-kusama --tmp --reserved-only --reserved-nodes ${ENDPOINT} --relay-chain-rpc-urls ${RELAYCHAIN}'
  },
}
const spawnOptions = {
//   shell: true,
//   stdio: [
//       'inherit', // StdIn.
//       'pipe',    // StdOut.
//       'pipe',    // StdErr.
//   ],
}

let bootNodes = {
  polkadot: {
    commandId: 'polkadot',
    members: {
      amforc: ['/dns/polkadot.bootnode.amforc.com/tcp/30333/p2p/12D3KooWAsuCEVCzUVUrtib8W82Yne3jgVGhQZN3hizko5FTnDg3'],
      dwellir: ['/dns/polkadot-boot.dwellir.com/tcp/30334/ws/p2p/12D3KooWKvdDyRKqUfSAaUCbYiLwKY8uK3wDWpCuy2FiDLbkPTDJ'],
      gatotech: ['/dns/dot-bootnode-cr.gatotech.network/tcp/31310/p2p/12D3KooWK4E16jKk9nRhvC4RfrDVgcZzExg8Q3Q2G7ABUUitks1w'],
      helikon: ['/dns/boot-node.helikon.io/tcp/7070/p2p/12D3KooWS9ZcvRxyzrSf6p63QfTCWs12nLoNKhGux865crgxVA4H'],
      metaspan: ['/dns/boot-polkadot.metaspan.io/tcp/13012/p2p/12D3KooWRjHFApinuqSBjoaDjQHvxwubQSpEVy5hrgC9Smvh92WF'],
      polkadotters: ['/dns/polkadot-bootnode.polkadotters.com/tcp/30333/p2p/12D3KooWPAVUgBaBk6n8SztLrMk8ESByncbAfRKUdxY1nygb9zG3'],
      stakeplus: ['/dns/boot.stake.plus/tcp/30333/p2p/12D3KooWKT4ZHNxXH4icMjdrv7EwWBkfbz5duxE5sdJKKeWFYi5n'],
      turboflakes: ['/dns/polkadot-bootnode.turboflakes.io/tcp/30300/p2p/12D3KooWHJBMZgt7ymAdTRtadPcGXpJw79vBGe8z53r9JMkZW7Ha'],
    }
  },
  kusama: {
    commandId: 'polkadot',
    members: {
      amforc: ['/dns/kusama.bootnode.amforc.com/tcp/30333/p2p/12D3KooWLx6nsj6Fpd8biP1VDyuCUjazvRiGWyBam8PsqRJkbUb9'],
      dwellir: ['/dns/kusama-boot.dwellir.com/tcp/30333/ws/p2p/12D3KooWFj2ndawdYyk2spc42Y2arYwb2TUoHLHFAsKuHRzWXwoJ'],
      gatotech: ['/dns/ksm-bootnode-cr.gatotech.network/tcp/31320/p2p/12D3KooWRNZXf99BfzQDE1C8YhuBbuy7Sj18UEf7FNpD8egbURYD'],
      helikon: ['/dns/boot-node.helikon.io/tcp/7060/p2p/12D3KooWL4KPqfAsPE2aY1g5Zo1CxsDwcdJ7mmAghK7cg6M2fdbD'],
      metaspan: ['/dns/boot-kusama.metaspan.io/tcp/23012/p2p/12D3KooWE1tq9ZL9AAxMiUBBqy1ENmh5pwfWabnoBPMo8gFPXhn6'],
      polkadotters: ['/dns/kusama-bootnode.polkadotters.com/tcp/30333/p2p/12D3KooWHB5rTeNkQdXNJ9ynvGz8Lpnmsctt7Tvp7mrYv6bcwbPG'],
      stakeplus: ['/dns/boot.stake.plus/tcp/31333/p2p/12D3KooWLa1UyG5xLPds2GbiRBCTJjpsVwRWHWN7Dff14yiNJRpR'],
      turboflakes: ['/dns/kusama-bootnode.turboflakes.io/tcp/30305/p2p/12D3KooWR6cMhCYRhbJdqYZfzWZT6bcck3unpRLk8GBQGmHBgPwu']
    }
  },
  westend: {
    commandId: 'polkadot',
    members: {
      amforc: ['/dns/westend.bootnode.amforc.com/tcp/30333/p2p/12D3KooWJ5y9ZgVepBQNW4aabrxgmnrApdVnscqgKWiUu4BNJbC8'],
      dwellir: [],
      gatotech: ['/dns/wnd-bootnode-cr.gatotech.network/tcp/31330/p2p/12D3KooWQGR1vUhoy6mvQorFp3bZFn6NNezhQZ6NWnVV7tpFgoPd'],
      helikon: ['/dns/boot-node.helikon.io/tcp/7080/p2p/12D3KooWRFDPyT8vA8mLzh6dJoyujn4QNjeqi6Ch79eSMz9beKXC'],
      metaspan: ['/dns/boot-westend.metaspan.io/tcp/33012/p2p/12D3KooWNTau7iG4G9cUJSwwt2QJP1W88pUf2SgqsHjRU2RL8pfa'],
      polkadotters: ['/dns/westend-bootnode.polkadotters.com/tcp/30333/p2p/12D3KooWHPHb64jXMtSRJDrYFATWeLnvChL8NtWVttY67DCH1eC5'],
      stakeplus: ['/dns/boot.stake.plus/tcp/32333/p2p/12D3KooWK8fjVoSvMq5copQYMsdYreSGPGgcMbGMgbMDPfpf3sm7'],
      turboflakes: ['/dns/westend-bootnode.turboflakes.io/tcp/30310/p2p/12D3KooWJvPDCZmReU46ghpCMJCPVUvUCav4WQdKtXQhZgJdH6tZ']
    }
  },
  'bridge-hub-kusama' : {
    commandId: 'parachain',
    members: {
      amforc: [
        "/dns/bridge-hub-kusama.bootnode.amforc.com/tcp/30337/p2p/12D3KooWGNeQJ5rXnEJkVUuQqwHd8aV5GkTAheaRoCaK8ZwW94id",
        "/dns/bridge-hub-kusama.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWGNeQJ5rXnEJkVUuQqwHd8aV5GkTAheaRoCaK8ZwW94id"
      ],
      dwellir: [],
      gatotech: [
        "/dns/boot-ksm-bridgehub-cr.gatotech.network/tcp/31327/p2p/12D3KooWFQFmg8UqAYLDNc2onySB6o5LLvpbx3eXZVqz9YFxAmXs",
        "/dns/boot-ksm-bridgehub-cr.gatotech.network/tcp/31427/ws/p2p/12D3KooWFQFmg8UqAYLDNc2onySB6o5LLvpbx3eXZVqz9YFxAmXs",
        "/dns/boot-ksm-bridgehub-cr.gatotech.network/tcp/31527/wss/p2p/12D3KooWFQFmg8UqAYLDNc2onySB6o5LLvpbx3eXZVqz9YFxAmXs"
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10250/p2p/12D3KooWDJLkhqQdXcVKWX7CqJHnpAY6PzrPc4ZG2CUWnARbmguy",
        "/dns/boot-node.helikon.io/tcp/10252/wss/p2p/12D3KooWDJLkhqQdXcVKWX7CqJHnpAY6PzrPc4ZG2CUWnARbmguy"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/26032/p2p/12D3KooWKfuSaZrLNz43PDgM4inMALXRHTSh2WBuqQtZRq8zmT1Z",
        "/dns/boot.metaspan.io/tcp/26036/wss/p2p/12D3KooWKfuSaZrLNz43PDgM4inMALXRHTSh2WBuqQtZRq8zmT1Z",
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/41333/p2p/12D3KooWBzbs2jsXjG5dipktGPKaUm9XWvkmeJFsEAGkVt946Aa7",
        "/dns/boot.stake.plus/tcp/41334/wss/p2p/12D3KooWBzbs2jsXjG5dipktGPKaUm9XWvkmeJFsEAGkVt946Aa7"
      ],
      turboflakes: [
        "/dns/bridge-hub-kusama-bootnode.turboflakes.io/tcp/30615/p2p/12D3KooWE3dJXbwA5SQqbDNxHfj7BXJRcy2KiXWjJY4VUMKoa7S2",
        "/dns/bridge-hub-kusama-bootnode.turboflakes.io/tcp/30715/wss/p2p/12D3KooWE3dJXbwA5SQqbDNxHfj7BXJRcy2KiXWjJY4VUMKoa7S2",
      ],
    }
  },
  'collectives-polkadot': {
    commandId: 'parachain',
    members: {
      amforc: [
        "/dns/collectives-polkadot.bootnode.amforc.com/tcp/30335/p2p/12D3KooWQeAjDnGkrPe5vtpfnB6ydZfWyMxyrXLkBFmA6o4k9aiU",
        "/dns/collectives-polkadot.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWQeAjDnGkrPe5vtpfnB6ydZfWyMxyrXLkBFmA6o4k9aiU"
      ],
      dwellir: [],
      gatotech: [
        "/dns/boot-dot-collectives-cr.gatotech.network/tcp/31316/p2p/12D3KooWGZsa9tSeLQ1VeC996e1YsCPuyRYMipHQuXikPjcKcpVQ",
        "/dns/boot-dot-collectives-cr.gatotech.network/tcp/31416/ws/p2p/12D3KooWGZsa9tSeLQ1VeC996e1YsCPuyRYMipHQuXikPjcKcpVQ",
        "/dns/boot-dot-collectives-cr.gatotech.network/tcp/31516/wss/p2p/12D3KooWGZsa9tSeLQ1VeC996e1YsCPuyRYMipHQuXikPjcKcpVQ"
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10230/p2p/12D3KooWS8CBz4P5CBny9aBy2EQUvAExFo9PUVT57X8r3zWMFkXT",
        "/dns/boot-node.helikon.io/tcp/10232/wss/p2p/12D3KooWS8CBz4P5CBny9aBy2EQUvAExFo9PUVT57X8r3zWMFkXT"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/16072/p2p/12D3KooWJWTTu2t2yg5bFRH6tjEpfzKwZir5R9JRRjQpgFPXdDfp",
        "/dns/boot.metaspan.io/tcp/16076/wss/p2p/12D3KooWJWTTu2t2yg5bFRH6tjEpfzKwZir5R9JRRjQpgFPXdDfp",
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/38333/p2p/12D3KooWQoVsFCfgu21iu6kdtQsU9T6dPn1wsyLn1U34yPerR6zQ",
        "/dns/boot.stake.plus/tcp/38334/wss/p2p/12D3KooWQoVsFCfgu21iu6kdtQsU9T6dPn1wsyLn1U34yPerR6zQ"
      ],
      turboflakes: [
        "/dns/collectives-polkadot-bootnode.turboflakes.io/tcp/30605/p2p/12D3KooWPyzM7eX64J4aG8uRfSARakDVtiEtthEM8FUjrLWAg2sC",
        "/dns/collectives-polkadot-bootnode.turboflakes.io/tcp/30705/wss/p2p/12D3KooWPyzM7eX64J4aG8uRfSARakDVtiEtthEM8FUjrLWAg2sC"
      ]
    }
  },
  'collectives-westend': {
    commandId: 'parachain',
    members: {
      amforc: [
        "/dns/collectives-westend.bootnode.amforc.com/tcp/30340/p2p/12D3KooWERPzUhHau6o2XZRUi3tn7544rYiaHL418Nw5t8fYWP1F",
        "/dns/collectives-westend.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWERPzUhHau6o2XZRUi3tn7544rYiaHL418Nw5t8fYWP1F"
      ],
      dwellir: [],
      gatotech: [
        "/dns/boot-wnd-collectives-cr.gatotech.network/tcp/31336/p2p/12D3KooWMedtdBGiSn7HLZusHwafXkZAdmWD18ciGQBfS4X1fv9K",
        "/dns/boot-wnd-collectives-cr.gatotech.network/tcp/31436/ws/p2p/12D3KooWMedtdBGiSn7HLZusHwafXkZAdmWD18ciGQBfS4X1fv9K",
        "/dns/boot-wnd-collectives-cr.gatotech.network/tcp/31536/wss/p2p/12D3KooWMedtdBGiSn7HLZusHwafXkZAdmWD18ciGQBfS4X1fv9K"
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10260/p2p/12D3KooWMzfnt29VAmrJHQcJU6Vfn4RsMbqPqgyWHqt9VTTAbSrL",
        "/dns/boot-node.helikon.io/tcp/10262/wss/p2p/12D3KooWMzfnt29VAmrJHQcJU6Vfn4RsMbqPqgyWHqt9VTTAbSrL"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/36072/p2p/12D3KooWEf2QXWq5pAbFJLfbnexA7KYtRRDSPkqTP64n1KtdsdV2",
        "/dns/boot.metaspan.io/tcp/36076/wss/p2p/12D3KooWEf2QXWq5pAbFJLfbnexA7KYtRRDSPkqTP64n1KtdsdV2"
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/38333/p2p/12D3KooWQoVsFCfgu21iu6kdtQsU9T6dPn1wsyLn1U34yPerR6zQ",
        "/dns/boot.stake.plus/tcp/38334/wss/p2p/12D3KooWQoVsFCfgu21iu6kdtQsU9T6dPn1wsyLn1U34yPerR6zQ",
      ],
      turboflakes: [
        "/dns/collectives-westend-bootnode.turboflakes.io/tcp/30700/wss/p2p/12D3KooWAe9CFXp6je3TAPQJE135KRemTLSqEqQBZMFwJontrThZ",
        "/dns/collectives-westend-bootnode.turboflakes.io/tcp/30700/wss/p2p/12D3KooWAe9CFXp6je3TAPQJE135KRemTLSqEqQBZMFwJontrThZ"
      ],
    }
  },
  statemine: {
    commandId: 'parachain',
    members: {
      amforc: [
        "/dns/statemine.bootnode.amforc.com/tcp/30336/p2p/12D3KooWHmSyrBWsc6fdpq8HtCFWasmLVLYGKWA2a78m4xAHKyBq",
        "/dns/statemine.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWHmSyrBWsc6fdpq8HtCFWasmLVLYGKWA2a78m4xAHKyBq"
      ],
      dwellir: [],
      gatotech: [
        "/dns/boot-ksm-statemine-cr.gatotech.network/tcp/31325/p2p/12D3KooWRMUYeWMPkadDG8baX9j1e95fspfp8MhPGym5BQza7Fm5",
        "/dns/boot-ksm-statemine-cr.gatotech.network/tcp/31425/ws/p2p/12D3KooWRMUYeWMPkadDG8baX9j1e95fspfp8MhPGym5BQza7Fm5",
        "/dns/boot-ksm-statemine-cr.gatotech.network/tcp/31525/wss/p2p/12D3KooWRMUYeWMPkadDG8baX9j1e95fspfp8MhPGym5BQza7Fm5",
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10210/p2p/12D3KooWFXRQce3aMgZMn5SxvHtYH4PsR63TZLf8LrnBsEVTyzdr",
        "/dns/boot-node.helikon.io/tcp/10212/wss/p2p/12D3KooWFXRQce3aMgZMn5SxvHtYH4PsR63TZLf8LrnBsEVTyzdr"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/26052/p2p/12D3KooW9z9hKqe3mqYAp5UJMhZiCqhkTHyiR43fegnGmTJ3JAba",
        "/dns/boot.metaspan.io/tcp/26056/wss/p2p/12D3KooW9z9hKqe3mqYAp5UJMhZiCqhkTHyiR43fegnGmTJ3JAba",
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/34333/p2p/12D3KooWAzSSZ7jLqMw1WPomYEKCYANQaKemXQ8BKoFvNEvfmdqR",
        "/dns/boot.stake.plus/tcp/34334/wss/p2p/12D3KooWAzSSZ7jLqMw1WPomYEKCYANQaKemXQ8BKoFvNEvfmdqR",
      ],
      turboflakes: [
        "/dns/statemine-bootnode.turboflakes.io/tcp/30320/p2p/12D3KooWN2Qqvp5wWgjbBMpbqhKgvSibSHfomP5VWVD9VCn3VrV4",
        "/dns/statemine-bootnode.turboflakes.io/tcp/30420/wss/p2p/12D3KooWN2Qqvp5wWgjbBMpbqhKgvSibSHfomP5VWVD9VCn3VrV4",
      ]
    }
  },
  statemint: {
    commandId: 'parachain',
    members: {
      amforc: [
        "/dns/statemint.bootnode.amforc.com/tcp/30341/p2p/12D3KooWByohP9FXn7ao8syS167qJsbFdpa7fY2Y24xbKtt3r7Ls",
        "/dns/statemint.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWByohP9FXn7ao8syS167qJsbFdpa7fY2Y24xbKtt3r7Ls"
      ],
      dwellir: [],
      gatotech: [
        "/dns/boot-dot-statemint-cr.gatotech.network/tcp/31315/p2p/12D3KooWKgwQfAeDoJARdtxFNNWfbYmcu6s4yUuSifnNoDgzHZgm",
        "/dns/boot-dot-statemint-cr.gatotech.network/tcp/31415/ws/p2p/12D3KooWKgwQfAeDoJARdtxFNNWfbYmcu6s4yUuSifnNoDgzHZgm",
        "/dns/boot-dot-statemint-cr.gatotech.network/tcp/31515/wss/p2p/12D3KooWKgwQfAeDoJARdtxFNNWfbYmcu6s4yUuSifnNoDgzHZgm"
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10220/p2p/12D3KooW9uybhguhDjVJc3U3kgZC3i8rWmAnSpbnJkmuR7C6ZsRW",
        "/dns/boot-node.helikon.io/tcp/10222/wss/p2p/12D3KooW9uybhguhDjVJc3U3kgZC3i8rWmAnSpbnJkmuR7C6ZsRW"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/16052/p2p/12D3KooWLwiJuvqQUB4kYaSjLenFKH9dWZhGZ4qi7pSb3sUYU651",
        "/dns/boot.metaspan.io/tcp/16056/wss/p2p/12D3KooWLwiJuvqQUB4kYaSjLenFKH9dWZhGZ4qi7pSb3sUYU651"
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/35333/p2p/12D3KooWFrQjYaPZSSLLxEVmoaHFcrF6VoY4awG4KRSLaqy3JCdQ",
        "/dns/boot.stake.plus/tcp/35334/wss/p2p/12D3KooWFrQjYaPZSSLLxEVmoaHFcrF6VoY4awG4KRSLaqy3JCdQ"
      ],
      turboflakes: [
        "/dns/statemint-bootnode.turboflakes.io/tcp/30315/p2p/12D3KooWL8CyLww3m3pRySQGGYGNJhWDMqko3j5xi67ckP7hDUvo",
        "/dns/statemint-bootnode.turboflakes.io/tcp/30415/wss/p2p/12D3KooWL8CyLww3m3pRySQGGYGNJhWDMqko3j5xi67ckP7hDUvo"
      ],
    }
  },
  westmint: {
    commandId: 'parachain',
    members: {
      amforc: [
        "/dns/westmint.bootnode.amforc.com/tcp/30339/p2p/12D3KooWNjKeaANaeZxBAPctmx8jugSYzuw4vnSCJmEDPB5mtRd6",
        "/dns/westmint.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWNjKeaANaeZxBAPctmx8jugSYzuw4vnSCJmEDPB5mtRd6"
      ],
      dwellir: [],
      gatotech: [
        "/dns/boot-wnd-westmint-cr.gatotech.network/tcp/31335/p2p/12D3KooWMSW6hr8KcNBhGFN1bg8kYC76o67PnuDEbxRhxacW6dui",
        "/dns/boot-wnd-westmint-cr.gatotech.network/tcp/31435/ws/p2p/12D3KooWMSW6hr8KcNBhGFN1bg8kYC76o67PnuDEbxRhxacW6dui",
        "/dns/boot-wnd-westmint-cr.gatotech.network/tcp/31535/wss/p2p/12D3KooWMSW6hr8KcNBhGFN1bg8kYC76o67PnuDEbxRhxacW6dui"
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10200/p2p/12D3KooWMRY8wb7rMT81LLuivvsy6ahUxKHQgYJw4zm1hC1uYLxb",
        "/dns/boot-node.helikon.io/tcp/10202/wss/p2p/12D3KooWMRY8wb7rMT81LLuivvsy6ahUxKHQgYJw4zm1hC1uYLxb"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/36052/p2p/12D3KooWBCqfNb6Y39DXTr4UBWXyjuS3hcZM1qTbHhDXxF6HkAJJ",
        "/dns/boot.metaspan.io/tcp/36056/wss/p2p/12D3KooWBCqfNb6Y39DXTr4UBWXyjuS3hcZM1qTbHhDXxF6HkAJJ"
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/33333/p2p/12D3KooWNiB27rpXX7EYongoWWUeRKzLQxWGms6MQU2B9LX7Ztzo",
        "/dns/boot.stake.plus/tcp/33334/wss/p2p/12D3KooWNiB27rpXX7EYongoWWUeRKzLQxWGms6MQU2B9LX7Ztzo"
      ],
      turboflakes: [
        "/dns/westmint-bootnode.turboflakes.io/tcp/30325/p2p/12D3KooWHU4qqSyqKdbXdrCTMXUJxxueaZjqpqSaQqYiFPw6XqEx",
        "/dns/westmint-bootnode.turboflakes.io/tcp/30425/wss/p2p/12D3KooWHU4qqSyqKdbXdrCTMXUJxxueaZjqpqSaQqYiFPw6XqEx"
      ],
    }
  },
  'encointer-kusama': {
    exec: 'encointer',
    members: {
      amforc: [
        "/dns/encointer-kusama.bootnode.amforc.com/tcp/30338/p2p/12D3KooWDBr4sfp9R7t7tA1LAkNzADcGVXW9rX1BryES47mhUMEz",
        "/dns/encointer-kusama.bootnode.amforc.com/tcp/30333/wss/p2p/12D3KooWDBr4sfp9R7t7tA1LAkNzADcGVXW9rX1BryES47mhUMEz"
      ],
      gatotech: [
        "/dns/boot-ksm-encointer-cr.gatotech.network/tcp/31326/p2p/12D3KooWByfCkLUzuMBJhVqb5SZxTHgGdwPzbJEk3t7gxDUakdi7",
        "/dns/boot-ksm-encointer-cr.gatotech.network/tcp/31426/ws/p2p/12D3KooWByfCkLUzuMBJhVqb5SZxTHgGdwPzbJEk3t7gxDUakdi7",
        "/dns/boot-ksm-encointer-cr.gatotech.network/tcp/31526/wss/p2p/12D3KooWByfCkLUzuMBJhVqb5SZxTHgGdwPzbJEk3t7gxDUakdi7"
      ],
      helikon: [
        "/dns/boot-node.helikon.io/tcp/10240/p2p/12D3KooWA911RYTs2DdsA1EkxviUo12DdAdJ9Zsaf8S5PpQzeRGA",
        "/dns/boot-node.helikon.io/tcp/10242/wss/p2p/12D3KooWA911RYTs2DdsA1EkxviUo12DdAdJ9Zsaf8S5PpQzeRGA"
      ],
      metaspan: [
        "/dns/boot.metaspan.io/tcp/26072/p2p/12D3KooWPtjFu99oadjbtbK33iir1jdYVdkEEs3GYV6nswJzwx8W",
        "/dns/boot.metaspan.io/tcp/26076/wss/p2p/12D3KooWPtjFu99oadjbtbK33iir1jdYVdkEEs3GYV6nswJzwx8W"
      ],
      stakeplus: [
        "/dns/boot.stake.plus/tcp/36333/p2p/12D3KooWNFFdJFV21haDiSdPJ1EnGmv6pa2TgB81Cvu7Y96hjTAu",
        "/dns/boot.stake.plus/tcp/36334/wss/p2p/12D3KooWNFFdJFV21haDiSdPJ1EnGmv6pa2TgB81Cvu7Y96hjTAu"
      ],
      turboflakes: [
        "/dns/encointer-kusama-bootnode.turboflakes.io/tcp/30625/p2p/12D3KooWCXoAM2ucUEhMhLkZVWJ6hMCHqV2K4sjVM27t5ZGv4XU6",
        "/dns/encointer-kusama-bootnode.turboflakes.io/tcp/30725/wss/p2p/12D3KooWCXoAM2ucUEhMhLkZVWJ6hMCHqV2K4sjVM27t5ZGv4XU6"
      ]
    }
  },
}

function testChain({ chain, commandId, memberId, endpoint }) {
  return new Promise((resolve, reject) => {
    const command = commands[commandId]
    console.debug('Starting test:', memberId, chain, commandId);
    const relaychain = relayChains[chain];
    const args = command.params
      .replace('${CHAIN}', chain)
      .replace('${ENDPOINT}', endpoint)
      .split(' ');
    // args.push('2>&1')

    // console.log('Starting node:', memberId, command.exec, args);

    const polkadotProcess = spawn(command.exec, args, spawnOptions);
    polkadotProcess.on('error', (err) => {
      console.error('ERROR', err);
      reject(err);
    })

    function matchData(data) {
      const log = data.toString();
      if(ECHOLOG) console.log('ECHOLOG', log);      
      // match on number of peers and syncing
      // 2023-05-16 10:11:43 ⚙️  Syncing, target=#15545644 (1 peers), best: #2698 (0x8c62…9f3f), finalized #2560 (0x81f3…fc71), ⬇ 210.7kiB/s ⬆ 2.7kiB/s  
      const match = log.match(/\((\d+) peers\)/);
      const numPeers = match ? parseInt(match[1]) : 0;
      if (log.includes('Syncing') && numPeers > 0) {
        clearTimeout(timeout);
        polkadotProcess.kill();
        resolve();
      }
    }

    const timeout = setTimeout(() => {
      polkadotProcess.kill();
      reject(new Error('Timeout'));
    }, 15000); // 15 seconds

    polkadotProcess.stderr.pipe(split2()).on('data', matchData);
    polkadotProcess.stdout.pipe(split2()).on('data', matchData);

    polkadotProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function testParaChain({ paraChainId, commandId, memberId, endpoint, relayChain }) {
  return new Promise((resolve, reject) => {
    const command = commands[commandId]
    console.debug('Starting test:', memberId, paraChainId, commandId);
    const args = command.params
      .replace('${CHAIN}', paraChainId)
      .replace('${ENDPOINT}', endpoint)
      .replace('${RELAYCHAIN}', relayChain)
      .split(' ');
    // args.push('2>&1')

    // console.log('Starting node:', memberId, command.exec, args);

    const polkadotProcess = spawn(command.exec, args, spawnOptions);
    polkadotProcess.on('error', (err) => {
      console.error('ERROR', err);
      reject(err);
    })

    function matchData(data) {
      const log = data.toString();
      if (ECHOLOG) console.log(log);      
      // match on number of peers and syncing
      // 2023-05-16 10:11:43 ⚙️  Syncing, target=#15545644 (1 peers), best: #2698 (0x8c62…9f3f), finalized #2560 (0x81f3…fc71), ⬇ 210.7kiB/s ⬆ 2.7kiB/s  
      const match = log.match(/\((\d+) peers\)/);
      const numPeers = match ? parseInt(match[1]) : 0;
      if (log.includes('Syncing') && numPeers > 0) {
        clearTimeout(timeout);
        polkadotProcess.kill();
        resolve();
      }
    }

    const timeout = setTimeout(() => {
      polkadotProcess.kill();
      reject(new Error('Timeout'));
    }, 15000); // 15 seconds

    polkadotProcess.stderr.pipe(split2()).on('data', matchData);
    polkadotProcess.stdout.pipe(split2()).on('data', matchData);

    polkadotProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function testChains() {
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i]
    console.log('chain', chain)
    const test = bootNodes[chain]
    // console.log('test', test)
    const { commandId, members } = test
    const memberIds = Object.keys(members)
    // console.log('memberIds', memberIds)
    for (let j = 0; j < memberIds.length; j++) {
      const memberId = memberIds[j]
      const endpoints = members[memberId]
      for (let k = 0; k < endpoints.length; k++) {
        const endpoint = endpoints[k]
        const node = { chain, commandId, memberId, endpoint }
        // console.log(node)
        try {
          await testChain(node)
          console.log('\n🟩', memberId, chain, endpoint, 'OK\n')
        } catch (err) {
          console.log('\n🟥', memberId, chain, endpoint, 'NOK\n')
        }
      }
    }
  }
}

async function testParaChains() {
  const paraChainIds = Object.keys(paraChains)
  for (let i = 0; i < paraChainIds.length; i++) {
    const paraChainId = paraChainIds[i]
    const chainId = paraChains[paraChainId]
    const relayChain = relayChains[chainId]
    console.log('paraChain', paraChainId, chainId, relayChain)
    const test = bootNodes[paraChainId]
    // console.log('test', test)
    const { commandId, members } = test
    const memberIds = Object.keys(members)
    // console.log('memberIds', memberIds)
    for (let j = 0; j < memberIds.length; j++) {
      const memberId = memberIds[j]
      const endpoints = members[memberId]
      for (let k = 0; k < endpoints.length; k++) {
        const endpoint = endpoints[k]
        const node = { paraChainId, commandId, memberId, endpoint, relayChain }
        // console.log(node)
        try {
          await testParaChain(node)
          console.log('\n🟩', memberId, paraChainId, endpoint, 'OK\n')
        } catch (err) {
          console.log('\n🟥', memberId, paraChainId, endpoint, 'NOK\n')
        }
      }
    }
  }

}

async function testAll() {
  // await testChains()
  await testParaChains()
}

testAll()
