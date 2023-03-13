// vuex-shim.d.ts

import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'

import { IState as IRootState } from './store'
import { IState as IHealthCheckState } from './store/modules/healthCheck'
import { IState as IMonitorState } from './store/modules/monitor'
import { IState as IServiceState } from './store/modules/service'

declare module '@vue/runtime-core' {
  // // Declare your own store states.
  // interface State {
  //   count: number
  // }

  interface ComponentCustomProperties {
    $store: Store<IRootState, IHealthCheckState, IMonitorState, IServiceState>
  }
}
