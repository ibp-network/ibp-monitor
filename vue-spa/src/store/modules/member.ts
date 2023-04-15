import axios from 'axios'
// import Vue from 'vue'
import { Module } from 'vuex'

import { IState as IRootState } from '../index'
export interface IState {
  list: any[]
  model: any
  healthChecks: any[]
}

// Vue.use(Vuex)

const member: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    model: {},
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
  },
  actions: {
    async getList({ commit, dispatch }: any) {
      const res = await axios.get('/api/member')
      commit('SET_LIST', res.data.members)
    },
    async setModel({ state, commit }: any, memberId: string) {
      const res = await axios.get(`/api/member/${memberId}`)
      commit('SET_MODEL', { ...res.data.member, healthChecks: res.data.healthChecks })
    },
  },
}

export default member
