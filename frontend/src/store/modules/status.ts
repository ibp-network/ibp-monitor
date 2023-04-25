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
  },
  actions: {
    async getData({ commit, dispatch }: any) {
      const statusData: IState = (await axios.get('/api/status')).data
      commit('SET_SERVICES', statusData.services)
      commit('SET_MEMBERS', statusData.members)
      commit('SET_STATUS', statusData.status)
    },
  },
}

export default status
