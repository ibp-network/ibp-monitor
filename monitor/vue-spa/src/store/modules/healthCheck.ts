import axios from 'axios'
import Vue from 'vue'
import Vuex, { Module } from 'vuex'

interface IState {
  list: any[]
  offset: number
  limit: number
  pagination: any
  healthCheck: any
  // healthChecks: any[]
}

Vue.use(Vuex)

const healthCheck = {
  namespaced: true,
  state: {
    list: [],
    offset: 0,
    limit: 15,
    healthCheck: {},
    pagination: { pages: [] }
    // healthChecks: []
  },
  mutations: {
    SET_LIST (state: IState, list: any[]) {
      state.list = list
    },
    SET_PAGINATION (state: IState, value: any) {
      state.pagination = value
    },
    SET_OFFSET (state: IState, value: number) {
      state.offset = value
    },
    SET_LIMIT (state: IState, value: number) {
      state.limit = value
    },
    SET_HEALTH_CHECK (state: IState, value: any) {
      console.debug('SET_HEALTH_CHECK()', value)
      state.healthCheck = value
    }
  },
  actions: {
    async getList ({ state, commit, dispatch }: any, { offset, limit }: any) {
      if (offset) { commit('SET_OFFSET', offset) }
      if (limit) { commit('SET_LIMIT', limit) }
      const res = await axios.get('/api/healthCheck', { params: { offset: offset || state.offset, limit: limit || state.limit } })
      commit('SET_LIST', res.data.models)
      commit('SET_PAGINATION', res.data.pagination)
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setHealthCheck ({ state, commit }: any, monitorId: string) {
      const res = await axios.get(`/api/healthCheck/${monitorId}`)
      commit('SET_HEALTH_CHECK', res.data.model)
    }
  }
}

export default healthCheck
