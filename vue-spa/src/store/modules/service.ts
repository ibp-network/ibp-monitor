import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IState {
  list: any[]
  service: any
  monitors: any[]
  nodes: any[]
  healthChecks: any[]
}

const service: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    service: {},
    monitors: [],
    nodes: [],
    healthChecks: [],
  },
  mutations: {
    SET_LIST(state: IState, list: any[]) {
      state.list = list
    },
    SET_SERVICE(state: IState, value: any) {
      console.debug('SET_SERVICE()', value)
      state.service = value
    },
    SET_MONITORS(state: IState, value: any) {
      console.debug('SET_MONITORS()', value)
      state.monitors = value
    },
    SET_HEALTH_CHECKS(state: IState, value: any) {
      console.debug('SET_HEALTH_CHECKS()', value)
      state.healthChecks = value
    },
  },
  // getters: {
  //   isReady () {
  //     return window.$polkadot ? window.$polkadot.isReady() : false
  //   }
  // },
  actions: {
    async getList({ commit, dispatch }: any) {
      const res = await axios.get('/api/service')
      commit('SET_LIST', res.data.services)
      // dispatch('init')
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setService({ state, commit }: any, serviceUrl: string) {
      // const service = state.list.find((f: any) => f.serviceUrl === serviceUrl)
      const res = await axios.get(`/api/service/${encodeURIComponent(serviceUrl)}`)
      const nodesRes = await axios.get(`/api/service/${encodeURIComponent(serviceUrl)}/nodes`)
      // commit('SET_DATETIME_FORMAT', res.data.dateTimeFormat)
      commit('SET_SERVICE', {
        ...res.data.service,
        monitors: res.data.monitors,
        nodes: nodesRes.data.nodes,
        healthChecks: res.data.healthChecks,
      })
      // commit('SET_MONITORS', res.data.monitors)
      // commit('SET_HEALTH_CHECKS', res.data.healthChecks)
    },
    // setCurrency ({ commit }, c: ICurrency) {
    //   commit('SET_CURRENCY', c)
    //   commit('SET_WALLET', testWallets[c.code])
    // }
  },
}

export default service
