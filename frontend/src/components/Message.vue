<template>
  <div class="section">
    <p class="title h4">Signature page</p>

    <!-- <input v-model="injected" id="injected" label="injected" type="text" disabled> -->
    <div class="control has-icons-left">
      <label class="label">Plugin</label>
      <div class="control">
        <div class="select">
          <select v-model="selPlugin">
            <option v-for="(plugin, idx) in injected" v-bind:key="idx" :value="plugin">
              {{ plugin.name }} ({{ plugin.version }})
            </option>
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
              {{ account.meta.name }} ({{ shortStash(account.address) }})
            </option>
          </select>
          <!-- {{filteredAccounts.length}} {{selAccount}} -->
        </div>
        <div class="icon is-small is-left">
          <i class="fa-solid fa-wallet"></i>
        </div>
      </div>
    </div>
    <br />

    <textarea
      v-model="message"
      id="message"
      class="textarea"
      placeholder="e.g. Enter your message here"
    >
  {
    "hello": "world"
  }
    </textarea>
    <button class="button" @click="signMessage()">Sign</button>

    <p class="title h4">Signature</p>
    <textarea
      v-model="result"
      id="signature"
      class="textarea"
      placeholder="Signature will display here"
    ></textarea>

    <div class="control has-icons-left">
      <!-- <label class="label">Peer</label>
      <div class="control">
        <div class="select">
          <select v-model="selPeer">
            <option v-for="(peer, idx) in peers" v-bind:key="idx" :value="peer">
              {{ peer.id }} ({{ peer.remotePeer.toString() }})
            </option>
          </select>
        </div>
        <div class="icon is-small is-left">
          <i class="fa-solid fa-wallet"></i>
        </div>
      </div> -->
    </div>
    <button class="button" @click="sendMessage()">Submit</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, computed, watch } from 'vue'
import { useStore } from 'vuex'
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
  setup() {
    const store = useStore()
    const localMonitorId = store.state.localMonitorId
    const injected = ref<IPlugin[]>([])
    const selPlugin = ref<IPlugin>()
    const peers = ref<any[]>()
    const selPeer: any = ref()
    const accounts = ref<IAccount[]>([])
    const selAccount = ref<IAccount>()
    const exampleMessage = {
      module: 'service',
      method: 'chill',
      params: { memberId: 'metaspan', serviceId: 'kusama' },
    }
    const message = ref(JSON.stringify(exampleMessage))
    const result = ref('')

    const filteredAccounts = computed((): any[] => {
      return accounts.value.filter((f: IAccount) => f.meta.source === selPlugin.value?.name)
    })

    const allInjected = async () => {
      injected.value = (await web3Enable('Dotsama IBP Monitor')) as []
    }
    const allAccounts = async () => {
      if (!injected.value) await allInjected()
      const web3accs = await web3Accounts()
      console.debug('web3accs', web3accs)
      accounts.value = web3accs as []
    }
    const submit = () => {
      console.log('not implemented!')
    }
    const signMessage = async () => {
      if (!injected.value) allInjected()
      // const accounts = await web3Accounts();
      const account = selAccount.value
      if (account?.meta.source) {
        const injector = await web3FromSource(account?.meta?.source) // could we get this from the extension?
        const signRaw = injector?.signer?.signRaw
        if (signRaw) {
          // after making sure that signRaw is defined
          // we can use it to sign our message
          try {
            const { signature } = await signRaw({
              address: account.address,
              data: stringToHex(message.value),
              type: 'bytes',
            })
            result.value = signature
          } catch (err: any) {
            result.value = err.toString()
          }
        } else {
          result.value = 'unknown?'
        }
      }
      // this.getPeers()
    }
    const sendMessage = async () => {
      store.dispatch('message/sendSignedMessage', {
        message: message.value,
        signature: result.value,
        address: selAccount.value?.address,
        // result: result.value,
        // peerId: selPeer.value.remotePeer.toString()
      })
    }

    onBeforeMount(async () => {
      const resp = await allInjected()
      console.debug(resp, injected.value)
      if (injected.value.length > 0) {
        selPlugin.value = injected.value[0]
      }
      allAccounts()
      console.debug('this.filteredAccounts.length', accounts.value, filteredAccounts.value.length)
      if (filteredAccounts.value.length > 0) selAccount.value = filteredAccounts.value[0]
    })

    return {
      localMonitorId,
      injected,
      selPlugin,
      peers,
      selPeer,
      accounts,
      selAccount,
      message,
      result,
      filteredAccounts,
      shortStash,
      signMessage,
      sendMessage,
    }
  },
  watch: {
    selPlugin: {
      deep: true,
      handler(newVal) {
        console.debug(newVal.name, this.filteredAccounts)
        this.$nextTick().then(() => {
          console.debug('this.filteredAccounts.length', this.filteredAccounts.length)
          if (this.filteredAccounts.length > 0) this.selAccount = this.filteredAccounts[0]
        })
      },
    },
  },
  methods: {
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
})
</script>
