import axios from 'axios'
import Vue from 'vue'
import { Module } from 'vuex'
// import { ICurrency } from '../../../types'
// import { ApiPromise, WsProvider } from '@polkadot/api'

import { IState as IRootState } from '../index'
// import { currencies } from './constants'
// import { PolkadotState, PolkadotWindow } from './types'
// declare let window: PolkadotWindow
export interface IState {
  list: any[]
  monitor: any
  healthChecks: any[]
}

// Vue.use(Vuex)

// const polkadot: Module<PolkadotState, IRootState> = {
const monitor: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    monitor: {},
    healthChecks: [],
  },
  mutations: {
    SET_LIST(state: IState, list: any[]) {
      state.list = list
    },
    SET_MONITOR(state: IState, value: any) {
      console.debug('SET_MONITOR()', value)
      state.monitor = value
    },
  },
  // getters: {
  //   isReady () {
  //     return window.$polkadot ? window.$polkadot.isReady() : false
  //   }
  // },
  actions: {
    async getList({ commit, dispatch }: any) {
      const res = await axios.get('/api/monitor')
      commit('SET_LIST', res.data.monitors)
      // dispatch('init')
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setMonitor({ state, commit }: any, monitorId: string) {
      // const service = state.list.find((f: any) => f.serviceUrl === serviceUrl)
      const res = await axios.get(`/api/monitor/${monitorId}`)
      // commit('SET_DATETIME_FORMAT', res.data.dateTimeFormat)
      commit('SET_MONITOR', { ...res.data.monitor, healthChecks: res.data.healthChecks })
      // commit('SET_MONITORS', res.data.monitors)
      // commit('SET_HEALTH_CHECKS', res.data.healthChecks)
    },
    // setCurrency ({ commit }, c: ICurrency) {
    //   commit('SET_CURRENCY', c)
    //   commit('SET_WALLET', testWallets[c.code])
    // }
  },
}

export default monitor
