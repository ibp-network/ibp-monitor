// import Vue from 'vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store'

import '@/assets/main.scss'

// import { Libp2pPlugin } from './plugins/libp2p'
// Vue.use(Libp2pPlugin, {})

// Vue.config.productionTip = false

// const app = createApp({
//   router,
//   store,
//   render: (h: any) => h(App)
// })
const app = createApp(App)
app.provide('$store', store)
app.use(store)
app.use(router)
// app.use(store, key)

app.mount('#app')
