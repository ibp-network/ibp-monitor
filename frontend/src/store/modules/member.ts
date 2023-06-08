import axios from 'axios'
// import Vue from 'vue'
import { Module } from 'vuex'

import { IState as IRootState } from '../index'
export interface IState {
  list: any[]
  model: any
  nodes: any[]
  healthChecks: any[]
}

const member: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    model: {},
    nodes: [],
    healthChecks: [],
  },
  mutations: {
    SET_LIST(state: IState, list: any[]) {
      state.list = list
    },
    SET_MODEL(state: IState, value: any) {
      console.debug('SET_MODEL()', value)
      state.model = value
    },
    SET_NODES(state: IState, value: any) {
      console.debug('SET_NODES()', value)
      state.nodes = value
    },
    SET_HEALTHCHECKS(state: IState, value: any) {
      console.debug('SET_HEALTHCHECKS()', value)
      state.healthChecks = value
    },
  },
  actions: {
    async getList({ commit, dispatch }: any) {
      const res = await axios.get('/api/member')
      commit('SET_LIST', res.data.members)
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setModel({ state, commit }: any, memberId: string) {
      const res = await axios.get(`/api/member/${memberId}`)
      commit('SET_MODEL', {
        ...res.data.member,
        healthChecks: res.data.healthChecks,
      })
    },
    async getNodes({ commit, dispatch }: any, memberId: string) {
      const res = await axios.get(`/api/member/${memberId}/nodes`)
      commit('SET_NODES', res.data.nodes)
    },
    async getChecks({ commit, dispatch }: any, memberId: string) {
      const res = await axios.get(`/api/member/${memberId}/healthChecks`)
      commit('SET_HEALTHCHECKS', res.data.healthChecks)
    },
  },
}

export default member
