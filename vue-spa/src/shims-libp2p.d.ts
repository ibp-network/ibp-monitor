// shims.libp2p.d.ts

// import { ComponentCustomProperties } from 'vue'
import { Libp2p } from 'libp2p'
// // import { Store } from 'vuex'
// import { Store } from '@/store'

import Vue from 'vue'
// declare module '*.vue' {
//   export default Vue
// }

// import { Libp2pPlugin } from './plugins/libp2p'
// // Vue.prototype.$polkadot = new PolkadotAPI({ chain: 'kusama' })

// declare module '@vue/runtime-core' {
declare module 'vue/types/vue' {
  // Declare your own store states.
  // interface State {
  //   count: number
  // }
  // interface ComponentCustomProperties {
  //   $libp2p: typeof Libp2pPlugin
  // }
  interface Vue {
    $libp2p: Libp2p
  }
}
