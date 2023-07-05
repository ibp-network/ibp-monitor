import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import axios from 'axios'

import geoDnsPool from './modules/geo-dns-pool'
import member from './modules/member'
import service from './modules/service'
import monitor from './modules/monitor'
import healthCheck from './modules/health-check'
import status from './modules/status'
import libp2p from './modules/libp2p'
import message from './modules/message'

export interface IState {
  apiVersion: string
  dark: boolean
  config: Record<string, any>
  showSideBar: boolean
  monitorCount: number
  memberCount: number
  serviceCount: number
  checkCount: number
  regions: Record<string, any>
  packageVersion: string
  dateTimeFormat: string
  localMonitorId: string
}
export const key: InjectionKey<Store<IState>> = Symbol('$store')

export const store = createStore({
  state: {
    apiVersion: '',
    dark: true,
    config: {},
    showSideBar: false,
    localMonitorId: '',
    monitorCount: 0,
    memberCount: 0,
    serviceCount: 0,
    checkCount: 0,
    regions: {
      africa: { name: 'Africa' },
      central_america: { name: 'Central America' },
      europe: { name: 'Europe' },
      north_america: { name: 'North America' },
      south_america: { name: 'South America' },
      middle_east: { name: 'Middle East' },
      oceania: { name: 'Oceania' },
      asia: { name: 'Asia' },
    },
    // defined in vite.config.js, injected by webpack.DefinePlugin
    packageVersion: PACKAGE_VERSION || '0.0.0',
    dateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
  },
  getters: {},
  mutations: {
    SET_LOCAL_MONITOR_ID(state: IState, value: string) {
      state.localMonitorId = value
    },
    SET_HOME(
      state: IState,
      { version, config, localMonitorId, memberCount, monitorCount, serviceCount, checkCount }
    ) {
      state.apiVersion = version
      state.config = config
      state.localMonitorId = localMonitorId
      state.monitorCount = monitorCount
      state.memberCount = memberCount
      state.serviceCount = serviceCount
      state.checkCount = checkCount
    },
    SET_CONFIG(state: IState, config: any) {
      state.config = config
    },
    SET_SIDE_BAR(state: IState, visible: boolean) {
      state.showSideBar = visible
    },
    SET_DARK(state: IState, dark: boolean) {
      state.dark = dark
    },
  },
  actions: {
    async init({ dispatch, commit }) {
      console.debug('init')
      dispatch('member/getList', {}, { root: true })
      dispatch('service/getList', {}, { root: true })
      const res = await axios.get('/api/home')
      commit('SET_HOME', res.data)
    },
    setLocalMonitorId({ commit }: any, value: string) {
      commit('SET_LOCAL_MONITOR_ID', value)
    },
    async getHome({ commit }) {
      const res = await axios.get('/api/home')
      commit('SET_HOME', res.data)
    },
    async getConfig({ commit }) {
      const res = await axios.get('/api/config')
      commit('SET_CONFIG', res.data)
    },
    setDark({ commit }, dark: boolean) {
      commit('SET_DARK', dark)
    },
    setSideBar({ commit }, visible: boolean) {
      commit('SET_SIDE_BAR', visible)
    },
    toggleSideBar({ state, commit }) {
      commit('SET_SIDE_BAR', !state.showSideBar)
    },
  },
  modules: {
    geoDnsPool,
    member,
    service,
    monitor,
    healthCheck,
    libp2p,
    message,
    status,
  },
})
