<template>
  <v-list lines="two">
    <!--
      {"peerId":"12D3KooWR87dpwfWdg8nQVx243ugPM66vFCcVVQCUu7Cn733YY9q","chain":"Kusama",
      "chainType":{"live":null},
      "health":{"peers":40,"isSyncing":false,"shouldHavePeers":true},
      "syncState":{"startingBlock":15276616,"currentBlock":15439788,"highestBlock":15439788},
      "version":"0.9.32-c71e872afed",
      "performance":94.72355604171753}
    -->
    <v-list-item v-for="hc in healthChecks" v-bind:key="hc.id" :to="`/healthCheck/${hc.id}`">
      <template v-slot:prepend>
        <v-icon :color="getLevelColor(hc.level)" :icon="getLevelIcon(hc.level)"></v-icon>
      </template>

      <v-list-item-title>
        <span class="text-caption">#{{ hc.id }}.</span> {{ hc.serviceId }}, {{ hc.memberId }}
      </v-list-item-title>
      <v-list-item-subtitle>
        at {{ formatDateTime(hc.createdAt) }}, by: {{ shortStash(hc.monitorId) }} ({{ hc.source }})
      </v-list-item-subtitle>

      <template v-slot:append>
        {{ hc.record?.performance?.toFixed(4) }}
      </template>
    </v-list-item>

    <Loading :loading="loading"></Loading>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'

import Loading from './Loading.vue'
import IsLocalMonitor from './IsLocalMonitor.vue'
import { IHealthCheck } from './types'

const levels: Record<string, string> = {
  debug: 'grey',
  log: 'info-dark',
  info: 'info-dark',
  success: 'success-dark',
  warning: 'warning-dark',
  error: 'danger',
}
const colors: Record<string, string> = {
  debug: 'grey',
  log: 'primary',
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
}
const icons: Record<string, string> = {
  debug: 'mdi-magnify', // 'fa-solid fa-magnifying-glass',
  log: 'mdi-information-outline', //'fa-solid fa-circle-info',
  info: 'mdi-information-outline', // 'fa-solid fa-circle-info',
  success: 'mdi-check-circle-outline', // 'fa-solid fa-circle-check',
  warning: 'mdi-alert-circle-outline', // 'fa-solid fa-circle-exclamation',
  error: 'mdi-alert-circle', // 'fa-solid fa-triangle-exclamation'
}

export default defineComponent({
  name: 'PeerTable',
  components: {
    Loading,
    IsLocalMonitor,
  },
  props: {
    columns: {
      type: Array,
      default() {
        return ['peerId', 'createdAt', 'updatedAt']
      },
      // services?
    },
    healthChecks: {
      // type: Array
      type: Object as PropType<[IHealthCheck]>,
    },
    loading: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState(['dateTimeFormat', 'localMonitorId']),
  },
  data() {
    return {
      // columns: []
    }
  },
  methods: {
    shortStash: shortStash,
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    getLevelClass(level: string) {
      return levels[level] || level
    },
    getLevelColor(level: string) {
      return colors[level] || level
    },
    getLevelIcon(level: string) {
      return icons[level] || 'fa-circle-question'
    },
    moment: moment,
  },
})
</script>
