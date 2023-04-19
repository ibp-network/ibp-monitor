import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IState {
  list: any[]
  service: any
  nodes: any[]
  healthChecks: any[]
}

const service: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    service: {},
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
    SET_HEALTH_CHECKS(state: IState, value: any) {
      console.debug('SET_HEALTH_CHECKS()', value)
      state.healthChecks = value
    },
    SET_NODES(state: IState, value: any) {
      console.debug('SET_NODES()', value)
      state.nodes = value
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
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setService({ state, commit }: any, serviceId: string) {
      const res = await axios.get(`/api/service/${serviceId}`)
      const nodesRes = await axios.get(`/api/service/${serviceId}/nodes`)
      commit('SET_SERVICE', {
        ...res.data.service,
        monitors: res.data.monitors,
        nodes: nodesRes.data.nodes,
        healthChecks: res.data.healthChecks,
      })
    },
  },
}

export default service
