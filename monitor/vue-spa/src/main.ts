import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/assets/main.scss'

import { Libp2pPlugin } from './plugins/libp2p'
Vue.use(Libp2pPlugin, {})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
