import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IState {
  list: any[]
}

const geoDnsPool: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
  },
  mutations: {
    SET_LIST(state: IState, list: any[]) {
      state.list = list
    },
  },
  actions: {
    async getList({ commit, dispatch }: any) {
      const res = await axios.get('/api/geoDnsPool')
      commit('SET_LIST', res.data.geoDnsPools)
    },
  },
}

export default geoDnsPool
