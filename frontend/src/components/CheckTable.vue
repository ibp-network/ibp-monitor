<template>
  <table class="table is-fullwidth">
    <!--
      {"peerId":"12D3KooWR87dpwfWdg8nQVx243ugPM66vFCcVVQCUu7Cn733YY9q","chain":"Kusama",
      "chainType":{"live":null},
      "health":{"peers":40,"isSyncing":false,"shouldHavePeers":true},
      "syncState":{"startingBlock":15276616,"currentBlock":15439788,"highestBlock":15439788},
      "version":"0.9.32-c71e872afed",
      "performance":94.72355604171753}
    -->
    <thead>
      <th></th>
      <th class="has-text-centered">Id</th>
      <th v-if="columns.includes('serviceId')" class="has-text-centered">Service</th>
      <th v-if="columns.includes('providerId')" class="has-text-centered">Member</th>
      <th v-if="columns.includes('monitorId')" class="has-text-centered">Monitor</th>
      <th v-if="columns.includes('source')" class="has-text-centered">Source</th>
      <th v-if="columns.includes('version')" class="has-text-centered">Version</th>
      <th v-if="columns.includes('performance')" class="has-text-right">
        <span class="d-none d-md-inline">Performance</span>
        <span class="d-inline d-md-none">Perf.</span>
        (ms)
      </th>
      <th class="has-text-centered">
        <span class="d-none d-md-inline">Timestamp</span>
        <span class="d-inline d-md-none">ts.</span>
        (UTC)
      </th>
    </thead>

    <tbody>
      <tr v-for="hc in healthChecks" v-bind:key="hc.id">
        <td :class="`text-${getStatusClass(hc.status)} has-text-centered`">
          <!-- <i :class="getLevelIcon(hc.level)"></i> -->
          <v-icon :color="getStatusColor(hc.status)" :icon="getStatusIcon(hc.status)"></v-icon>
        </td>
        <td>
          <router-link :to="`/healthCheck/${hc.id}`">{{ hc.id }}</router-link>
        </td>
        <!-- <td><a href="/peer/<%= hc.peerId %> "><%= shortStash(hc.peerId) %></a></td> -->
        <td v-if="columns.includes('serviceId')">
          <router-link :to="`/service/${hc.serviceId}`">{{ hc.serviceId }}</router-link>
        </td>
        <td v-if="columns.includes('providerId')">
          <router-link v-if="hc.memberId" :to="`/member/${hc.providerId}`">{{ hc.providerId }}</router-link>
          <p v-else>{{ hc.providerId }}</p>
        </td>
        <td v-if="columns.includes('monitorId')">
          <router-link :to="`/monitor/${hc.monitorId}`">{{ shortStash(hc.monitorId) }}</router-link>
          <!-- <%- include(templateDir + '/isLocalMonitor.ejs', { monitorId: hc.monitorId, localMonitorId }); -%> -->
          <sup><IsLocalMonitor :monitorId="hc.monitorId"></IsLocalMonitor></sup>
        </td>
        <td v-if="columns.includes('source')">{{ hc.source }}</td>
        <td v-if="columns.includes('version')">{{ hc.record?.version || 'unknown' }}</td>
        <td v-if="columns.includes('performance')" class="has-text-right">
          {{ hc.record?.performance?.toFixed(4) }}
        </td>
        <td>{{ formatDateTime(hc.createdAt) }}</td>
      </tr>
    </tbody>
    <Loading :loading="loading"></Loading>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'

import Loading from './Loading.vue'
import IsLocalMonitor from './IsLocalMonitor.vue'
import { IHealthCheck } from './types'

const statusClasses: Record<string, string> = {
  debug: 'grey',
  log: 'info-dark',
  info: 'info-dark',
  success: 'success-dark',
  warning: 'warning-dark',
  error: 'danger',
}
const statusColors: Record<string, string> = {
  debug: 'grey',
  log: 'primary',
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
}
const statusIcons: Record<string, string> = {
  debug: 'mdi-magnify', // 'fa-solid fa-magnifying-glass',
  log: 'mdi-information-outline', //'fa-solid fa-circle-info',
  info: 'mdi-information-outline', // 'fa-solid fa-circle-info',
  success: 'mdi-check-circle-outline', // 'fa-solid fa-circle-check',
  warning: 'mdi-alert-circle-outline', // 'fa-solid fa-circle-exclamation',
  error: 'mdi-alert-circle', // 'fa-solid fa-triangle-exclamation'
}

export default defineComponent({
  name: 'CheckTable',
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
    getStatusClass(status: string) {
      return statusClasses[status] || status
    },
    getStatusColor(status: string) {
      return statusColors[status] || status
    },
    getStatusIcon(status: string) {
      return statusIcons[status] || 'fa-circle-question'
    },
    moment: moment,
  },
})
</script>
