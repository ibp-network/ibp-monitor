import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import service from './modules/service'
import monitor from './modules/monitor'
import healthCheck from './modules/healthCheck'
import libp2p from './modules/libp2p'

Vue.use(Vuex)

interface IState {
  apiVersion: string
  monitorCount: number
  serviceCount: number
  checkCount: number
  packageVersion: string
  dateTimeFormat: string
  localMonitorId: string
}

export default new Vuex.Store({
  state: {
    apiVersion: '',
    localMonitorId: '',
    monitorCount: 0,
    serviceCount: 0,
    checkCount: 0,
    packageVersion: process.env.PACKAGE_VERSION || '0',
    dateTimeFormat: 'DD/MM/YYYY HH:mm:ss'
  },
  getters: {
  },
  mutations: {
    SET_LOCAL_MONITOR_ID (state: IState, value: string) {
      state.localMonitorId = value
    },
    SET_HOME (state: IState, { version, localMonitorId, monitorCount, serviceCount, checkCount }) {
      state.apiVersion = version
      state.localMonitorId = localMonitorId
      state.monitorCount = monitorCount
      state.serviceCount = serviceCount
      state.checkCount = checkCount
    }
  },
  actions: {
    setLocalMonitorId ({ commit }: any, value: string) {
      commit('SET_LOCAL_MONITOR_ID', value)
    },
    async getHome ({ commit }) {
      const res = await axios.get('/api/home')
      commit('SET_HOME', res.data)
    }
  },
  modules: {
    service,
    monitor,
    healthCheck,
    libp2p
  }
})
