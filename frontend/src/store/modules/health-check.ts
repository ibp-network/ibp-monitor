import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IState {
  list: any[]
  loading: boolean
  offset: number
  limit: number
  where: Record<string, any>
  pagination: any
  healthCheck: any
  // healthChecks: any[]
}

const healthCheck: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    loading: false,
    offset: 0,
    limit: 15,
    where: {},
    healthCheck: {},
    pagination: { pages: [] },
    // healthChecks: []
  },
  mutations: {
    SET_LIST(state: IState, list: any[]) {
      state.list = list
    },
    SET_LOADING(state: IState, value: any) {
      state.loading = value
    },
    SET_PAGINATION(state: IState, value: any) {
      state.pagination = value
    },
    SET_OFFSET(state: IState, value: number) {
      state.offset = value
    },
    SET_LIMIT(state: IState, value: number) {
      state.limit = value
    },
    SET_WHERE(state: IState, value: any) {
      state.where = value
    },
    SET_HEALTH_CHECK(state: IState, value: any) {
      console.debug('SET_HEALTH_CHECK()', value)
      state.healthCheck = value
    },
  },
  actions: {
    // async init({ commit }) {
    //   let res = await axios.get('/api/service')
    // },
    async getList({ state, commit, dispatch }: any, { offset, limit, where }: any) {
      if (offset) {
        commit('SET_OFFSET', offset)
      }
      if (limit) {
        commit('SET_LIMIT', limit)
      }
      if (where) {
        commit('SET_WHERE', where)
      }
      commit('SET_LOADING', true)
      const res = await axios.get('/api/healthCheck', {
        params: {
          offset: offset || state.offset,
          limit: limit || state.limit,
          memberId: state.where.memberId || '',
          serviceId: state.where.serviceId || '',
          source: state.where.source || '',
        },
      })
      commit('SET_LIST', res.data.models)
      commit('SET_LOADING', false)
      commit('SET_PAGINATION', res.data.pagination)
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setHealthCheck({ state, commit }: any, monitorId: string) {
      const res = await axios.get(`/api/healthCheck/${monitorId}`)
      commit('SET_HEALTH_CHECK', res.data.model)
    },
  },
}

export default healthCheck
