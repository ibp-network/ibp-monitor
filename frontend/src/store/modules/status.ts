import axios from 'axios'
import { Module } from 'vuex'
import { IState as IRootState } from '../index'

export interface IStatus {
  [serviceId: string]: {
    [hourTimestamp: number]: {
      [memberId: string]: {
        success: number
        warning: number
        error: number
        status: string
      }
    }
  }
}

export interface IState {
  services: any[]
  members: any[]
  loading: boolean
  status: {
    [serviceId: string]: {
      [hourTimestamp: number]: {
        [memberId: string]: string
      }
    }
  }
}

const status: Module<IState, IRootState> = {
  namespaced: true,
  state: {
    services: [],
    members: [],
    loading: false,
    status: {},
  },
  mutations: {
    SET_SERVICES(state: IState, services: any[]) {
      state.services = services
    },
    SET_MEMBERS(state: IState, members: any[]) {
      state.members = members
    },
    SET_STATUS(state: IState, status: {}) {
      state.status = status
    },
    SET_LOADING(state: IState, loading: boolean) {
      state.loading = loading
    },
  },
  actions: {
    async getData({ commit }: any) {
      // a small delay before showing the loading indicator
      const timeout = setTimeout(() => {
        commit('SET_LOADING', true)
      }, 500)
      // testing: wait for 2 seconds
      // await new Promise(resolve => setTimeout(resolve, 2000))
      const statusData: IState = (await axios.get('/api/status')).data
      commit('SET_SERVICES', statusData.services)
      commit('SET_MEMBERS', statusData.members)
      commit('SET_STATUS', statusData.status)
      if(timeout) clearTimeout(timeout)
      commit('SET_LOADING', false)
    },
  },
}

export default status
