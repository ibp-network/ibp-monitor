import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IState {
  list: any[]
  service: any
  // monitors: any[]
  healthChecks: any[]
}

const service: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    list: [],
    service: {},
    // monitors: [],
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
    // SET_MONITORS (state: IState, value: any) {
    //   console.debug('SET_MONITORS()', value)
    //   state.monitors = value
    // },
    SET_HEALTH_CHECKS(state: IState, value: any) {
      console.debug('SET_HEALTH_CHECKS()', value)
      state.healthChecks = value
    },
    // SET_CURRENCY (state: IState, value: ICurrency) {
    //   state.currency = value
    // },
    // SET_GENESIS_HASH (state: IState, value: string) {
    //   state.genesisHash = value
    // },
    // SET_AMOUNT (state: IState, amount: string) {
    //   // console.debug('SET_CURRENCY', value)
    //   state.amount = amount
    // }
  },
  // getters: {
  //   isReady () {
  //     return window.$polkadot ? window.$polkadot.isReady() : false
  //   }
  // },
  actions: {
    // async init ({ state: IState, commit }) {
    //   console.debug('store/modules/polkadot: init()', state.currency)
    //   if (window.$polkadot) {
    //     // const isReady = await window.$polkadot.isReady
    //     // console.debug('isReady', isReady)
    //     await window.$polkadot.disconnect()
    //   }
    //   const wsProvider = new WsProvider(state.currency.endpoint)
    //   const api = await ApiPromise.create({ provider: wsProvider })
    //   window.$polkadot = api
    //   try {
    //     await commit('SET_WALLET', testWallets[state.currency.code])
    //     const gh = await window.$polkadot.genesisHash.toString() // .toHex()
    //     await commit('SET_GENESIS_HASH', gh)
    //     console.debug('genesisHash', gh)
    //   } catch (err) {
    //     console.error(err)
    //   // } finally {
    //   //   await api.close()
    //   }
    // },
    async getList({ commit, dispatch }: any) {
      const res = await axios.get('/api/service')
      commit('SET_LIST', res.data.services)
      // dispatch('init')
      dispatch('setLocalMonitorId', res.data.localMonitorId, { root: true })
    },
    async setService({ state, commit }: any, serviceId: string) {
      // const service = state.list.find((f: any) => f.serviceUrl === serviceUrl)
      const res = await axios.get(`/api/service/${encodeURIComponent(serviceId)}`)
      // commit('SET_DATETIME_FORMAT', res.data.dateTimeFormat)
      commit('SET_SERVICE', {
        ...res.data.service,
        monitors: res.data.monitors,
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
