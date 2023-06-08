import axios from 'axios'
import { Module } from 'vuex'

import { IState as IRootState } from '../index'
export interface IState {
}

const message: Module<IState, IRootState> = {
  namespaced: true,
  state: {
  },
  mutations: {
  },
  actions: {
  },
}

export default message
