# tests for boot nodes

## Dependencies

```bash
git clone https://github.com/paritytech/polkadot
# build the executable
cargo build --release

git clone https://github.com/paritytech/cumulus
# build the executable
cargo build --release --bin polkadot-parachain

git clone https://github.com/encointer/encointer-parachain
# build the executable
cargo build --release
```


```js
let commands = {
  polkadot: { exec: '/path/to/polkadot', params: '--chain ${CHAIN} --tmp --name "IBP Bootnode test" --reserved-only --reserved-nodes ${RESERVED_NODE}' },
  // kusama: '/path/to/polkadot',
  // westend: '/path/to/polkadot',
  parachain: { exec: '/path/to/polkadot-parachain', params: [] },
  encointer: { exec: '/path/to/encointer-collator', params: '--chain encointer-kusama --tmp --reserved-only --reserved-nodes ${RESERVED_NODE}' },
}

let bootNodes = {
  polkadot: {
    exec: 'polkadot',
    endpoints: {
      metaspan: ["/dns/boot-polkadot.metaspan.io/tcp/13012/p2p/12D3KooWRjHFApinuqSBjoaDjQHvxwubQSpEVy5hrgC9Smvh92WF"],
      metaspan: ["/dns/boot-polkadot.metaspan.io/tcp/13012/p2p/12D3KooWRjHFApinuqSBjoaDjQHvxwubQSpEVy5hrgC9Smvh92WF"]
    }
  },
  kusama: {
    exec: 'polkadot',
    endpoints: {
      metaspan: ["/dns/boot-kusama.metas"]
    }
  },
  westend: {
    exec: 'polkadot',
    endpoints: {
      metaspan: []
    }
  },
  'encointer-kusama': {
    exec: 'encointer',
    endpoints: {
      metaspan: ["/dns/boot.metaspan.io/tcp/26072/p2p/12D3KooWPtjFu99oadjbtbK33iir1jdYVdkEEs3GYV6nswJzwx8W",
                 "/dns/boot.metaspan.io/tcp/26076/wss/p2p/12D3KooWPtjFu99oadjbtbK33iir1jdYVdkEEs3GYV6nswJzwx8W"],
      stakeplus: ["/dns/boot.stake.plus/tcp/36333/p2p/12D3KooWNFFdJFV21haDiSdPJ1EnGmv6pa2TgB81Cvu7Y96hjTAu"]
    }
  },
}
```

```sh
polkadot --chain polkadot --tmp \
    --name "Bootnode testnode" \
    --reserved-only \
    --reserved-nodes "/dns/boot-polkadot.metaspan.io/tcp/13012/p2p/12D3KooWRjHFApinuqSBjoaDjQHvxwubQSpEVy5hrgC9Smvh92WF"  \
    --no-hardware-benchmarks
```

## Encointer

```sh
./encointer-collator --chain encointer-kusama --tmp \
    --reserved-only \
    --reserved-nodes "/dns/boot.stake.plus/tcp/36333/p2p/12D3KooWNFFdJFV21haDiSdPJ1EnGmv6pa2TgB81Cvu7Y96hjTAu"
```
