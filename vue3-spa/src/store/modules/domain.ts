import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IState {
  list: any[]
  domain: any
}

const domain: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    domain: {}
  },
  mutations: {
    SET_LIST (state: IState, list: any[]) {
      state.list = list
    },
    SET_DOMAIN (state: IState, value: any) {
      console.debug('SET_DOMAIN()', value)
      state.domain = value
    },
    SET_DOMAINS (state: IState, value: any) {
      console.debug('SET_DOMAINS()', value)
      state.list = value
    },
  },
  actions: {
    async getList ({ commit, dispatch }: any) {
      const res = await axios.get('/api/domain')
      commit('SET_LIST', res.data.domains)
    },
    async setDomain ({ state, commit }: any, domainId: string) {
      // const service = state.list.find((f: any) => f.serviceUrl === serviceUrl)
      const res = await axios.get(`/api/domain/${domainId}`)
      commit('SET_DOMAIN', { ...res.data.domain })
    }
  }
}

export default domain
