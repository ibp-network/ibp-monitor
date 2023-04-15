import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import axios from 'axios'

import member from './modules/member'
import service from './modules/service'
import monitor from './modules/monitor'
import healthCheck from './modules/healthCheck'
import libp2p from './modules/libp2p'

// Vue.use(Vuex)

export interface IState {
  apiVersion: string
  config: Record<string, any>
  monitorCount: number
  memberCount: number
  serviceCount: number
  checkCount: number
  packageVersion: string
  dateTimeFormat: string
  localMonitorId: string
}
export const key: InjectionKey<Store<IState>> = Symbol('$store')

export const store = createStore({
  state: {
    apiVersion: '',
    config: {},
    localMonitorId: '',
    monitorCount: 0,
    memberCount: 0,
    serviceCount: 0,
    checkCount: 0,
    packageVersion: process.env.PACKAGE_VERSION || '0',
    dateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
  },
  getters: {},
  mutations: {
    SET_LOCAL_MONITOR_ID(state: IState, value: string) {
      state.localMonitorId = value
    },
    SET_HOME(
      state: IState,
      { version, config, localMonitorId, memberCount, monitorCount, serviceCount, checkCount }
    ) {
      state.apiVersion = version
      state.config = config
      state.localMonitorId = localMonitorId
      state.monitorCount = monitorCount
      state.memberCount = memberCount
      state.serviceCount = serviceCount
      state.checkCount = checkCount
    },
    SET_CONFIG(state: IState, config: any) {
      state.config = config
    },
  },
  actions: {
    setLocalMonitorId({ commit }: any, value: string) {
      commit('SET_LOCAL_MONITOR_ID', value)
    },
    async getHome({ commit }) {
      const res = await axios.get('/api/home')
      commit('SET_HOME', res.data)
    },
    async getConfig({ commit }) {
      const res = await axios.get('/api/config')
      commit('SET_CONFIG', res.data)
    },
  },
  modules: {
    member,
    service,
    monitor,
    healthCheck,
    libp2p,
  },
})
