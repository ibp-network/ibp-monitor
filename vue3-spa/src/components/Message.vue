<template>
  <div class="section">

    <p class="title h4">Signature page</p>

    <!-- <input v-model="injected" id="injected" label="injected" type="text" disabled> -->
    <div class="control has-icons-left">
      <label class="label">Plugin</label>
      <div class="control">
        <div class="select">
          <select v-model="selPlugin">
            <option v-for="(plugin, idx) in injected" v-bind:key="idx" :value="plugin">{{plugin.name}} ({{plugin.version}})</option>
          </select>
          <!-- {{selPlugin}} -->
        </div>
        <div class="icon is-small is-left">
          <i class="fa-solid fa-puzzle-piece"></i>
        </div>
      </div>
    </div>

    <div class="control has-icons-left">
      <label class="label">Account</label>
      <div class="control">
        <div class="select">
          <select v-model="selAccount">
            <option v-for="(account, idx) in filteredAccounts" v-bind:key="idx" :value="account">
              {{account.meta.name}} ({{shortStash(account.address)}})
            </option>
          </select>
          <!-- {{filteredAccounts.length}} {{selAccount}} -->
        </div>
        <div class="icon is-small is-left">
          <i class="fa-solid fa-wallet"></i>
        </div>
      </div>
    </div>
    <br>

    <textarea v-model="message" id="message" class="textarea" placeholder="e.g. Enter your message here">
  {
    "hello": "world"
  }
    </textarea>
    <button class="button" @click="sign()">Sign</button>

    <p class="title h4">Signature</p>
    <textarea v-model="result" id="signature" class="textarea" placeholder="Signature will display here"></textarea>

    <div class="control has-icons-left">
      <label class="label">Peer</label>
      <div class="control">
        <div class="select">
          <select v-model="selPeer">
            <option v-for="(peer, idx) in peers" v-bind:key="idx" :value="peer">
              {{peer.id}} ({{peer.remotePeer.toString()}})
            </option>
          </select>
          <!-- {{filteredAccounts.length}} {{selAccount}} -->
        </div>
        <div class="icon is-small is-left">
          <i class="fa-solid fa-wallet"></i>
        </div>
      </div>
    </div>
    <button class="button" @click="submit()">Submit</button>
  </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
// import { Libp2p } from 'libp2p'
import { Keyring } from '@polkadot/keyring'
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp'
import { stringToHex } from '@polkadot/util'
import { pipe } from 'it-pipe'

import { shortStash } from './utils'
// // Add below code sample to your component
// declare module 'vue/types/vue' {
//   interface Vue {
//     $libp2p: Libp2p
//     // fields: Field[];
//     // doThisClick: () => void;
//     // doThisInput: () => void;
//   }
// }

// import { Keyring } from '@polkadot/keyring'
// import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
// async function start () {
//   const allInjected = await web3Enable('Dotsama IBP Monitor')
// }
interface IPlugin {
  accounts?: any
  metadata?: any
  name: string
  provider: any
  signer: any
  version: string
}
interface IAccountMeta {
  name?: string
  genesisHash?: string | null | undefined
  source: string // name of plugin?
}
interface IAccount {
  address: string
  meta: IAccountMeta
  type: string
}

// interface IData {
//   injected: IPlugin[]
//   selPlugin: IPlugin
//   accounts: IAccount[]
//   selAccount: IAccount
//   peers: any[]
//   selPeer: any
//   message: string
//   result: string
// }
// interface IMethods {
//   shortStash (stash: string): string
//   allInjected (): void
//   allAccounts (): void
//   sign (): void
//   getPeers (): void
//   submit (): void
// }
// interface IComputed {
//   localMonitorId: string
//   // dateTimeFormat: string
//   filteredAccounts: IAccount[]
// }
// // eslint-disable-next-line
// interface IProps {}

// export default defineComponent<IData, IMethods, IComputed, IProps>({
export default defineComponent({
  name: 'MessageC',
  computed: {
    ...mapState(['localMonitorId']),
    filteredAccounts (): any[] {
      return this.accounts.filter((f: IAccount) => f.meta.source === this.selPlugin.name)
    }
  },
  data () {
    return {
      injected: [] as IPlugin[],
      selPlugin: {} as IPlugin,
      peers: [] as any[],
      selPeer: {},
      accounts: [] as IAccount[],
      selAccount: {} as IAccount,
      message: '{\n    "hello": "world"\n}',
      result: ''
    }
  },
  watch: {
    selPlugin: {
      deep: true,
      handler (newVal) {
        console.debug(newVal.name, this.filteredAccounts)
        this.$nextTick().then(() => {
          console.debug('this.filteredAccounts.length', this.filteredAccounts.length)
          if (this.filteredAccounts.length > 0) this.selAccount = this.filteredAccounts[0]
        })
      }
    }
  },
  methods: {
    shortStash,
    async allInjected () {
      this.injected = await web3Enable('Dotsama IBP Monitor') as []
    },
    async allAccounts () {
      if (!this.injected) await this.allInjected()
      const web3accs = await web3Accounts()
      console.debug('web3accs', web3accs)
      this.accounts = web3accs as []
    },
    submit () {
      console.log('not implemented!')
    },
    async sign () {
    //   if (!this.injected) this.allInjected()
    //   // const accounts = await web3Accounts();
    //   const account = this.selAccount
    //   const injector = await web3FromSource(account?.meta.source) // could we get this from the extension?
    //   const signRaw = injector?.signer?.signRaw
    //   if (signRaw) {
    //     // after making sure that signRaw is defined
    //     // we can use it to sign our message
    //     try {
    //       const { signature } = await signRaw({
    //         address: account.address,
    //         data: stringToHex(this.message),
    //         type: 'bytes'
    //       })
    //       this.result = signature
    //     } catch (err: any) {
    //       this.result = err.toString()
    //     }
    //   } else {
    //     this.result = 'unknown?'
    //   }
    //   this.getPeers()
    },
    // async getPeers () {
    //   const peers = this.$libp2p.connectionManager.getConnections()
    //   console.debug(peers)
    //   this.peers = peers
    // },
    // async submit () {
    //   console.debug('submit()')
    //   if (this.$libp2p === undefined) {
    //     console.debug('libp2p not running...')
    //     // let res = await libp2p.dial('/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct')
    //     // consol.debug(res)
    //   } else {
    //     console.debug('libp2p is running...')
    //     // console.debug(libp2p)
    //     // let peerId = {
    //     //   type: '',
    //     //   multiaddrs: ['/ip4/127.0.0.1/tcp/30000/p2p/' + localMonitorId, '/ip4/127.0.0.1/tcp/9090/ws']
    //     // }
    //     // console.debug('peerId', peerId) // multiaddr?
    //     const stream = await this.$libp2p.dialProtocol(this.selPeer.remoteAddr, '/ibp/ping')
    //     try {
    //       await pipe(
    //         [new Uint8Array([5]), new Uint8Array([1, 2, 3, 4, 5])],
    //         stream
    //       )
    //     } catch (err) {
    //       console.warn(err)
    //     }
    //     console.log('listenerCount', this.$libp2p.connectionManager.listenerCount(''))
    //   }
    // }
  },
  async mounted () {
    const resp = await this.allInjected()
    console.debug(resp, this.injected)
    if (this.injected.length > 0) { this.selPlugin = this.injected[0] }
    this.allAccounts()
    console.debug('this.filteredAccounts.length', this.accounts, this.filteredAccounts.length)
    if (this.filteredAccounts.length > 0) this.selAccount = this.filteredAccounts[0]
  }
})
</script>
