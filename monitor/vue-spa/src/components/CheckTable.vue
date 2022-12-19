<template>

  <table class="table is-fullwidth has-text-centered">
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
      <!-- <th>Sender</th> -->
      <th v-if="columns.includes('serviceUrl')" class="has-text-centered">Service</th>
      <th v-if="columns.includes('monitorId')" class="has-text-centered">Monitor</th>
      <th class="has-text-centered">Source</th>
      <th class="has-text-centered">Version</th>
      <th class="has-text-right">Performance (ms)</th>
      <th class="has-text-centered">Timestamp (UTC)</th>
    </thead>

    <tbody>
      <tr v-for="hc in healthChecks" v-bind:key="hc.id">
        <td :class="`has-text-${getLevelClass(hc.level)} has-text-centered`">
          <i :class="getLevelIcon(hc.level)"></i>
        </td>
        <td><router-link :to="`/healthCheck/${hc.id}`">{{hc.id}}</router-link></td>
        <!-- <td><a href="/peer/<%= hc.peerId %> "><%= shortStash(hc.peerId) %></a></td> -->
        <td v-if="columns.includes('serviceUrl')"><router-link :to="`/service/${encodeURIComponent(hc.serviceUrl)}`">{{hc.serviceUrl}}</router-link></td>
        <td v-if="columns.includes('monitorId')">
          <router-link :to="`/monitor/${hc.monitorId}`">{{shortStash(hc.monitorId)}}</router-link>
          <!-- <%- include(templateDir + '/isLocalMonitor.ejs', { monitorId: hc.monitorId, localMonitorId }); -%> -->
          <sup><IsLocalMonitor :monitorId="hc.monitorId"></IsLocalMonitor></sup>
        </td>
        <td>{{hc.source}}</td>
        <td>{{hc.record?.version || 'unknown'}}</td>
        <td class="has-text-right">{{hc.record?.performance?.toFixed(4)}}</td>
        <td>{{formatDateTime(hc.createdAt)}}</td>
      </tr>
    </tbody>
  </table>

</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'

import IsLocalMonitor from './IsLocalMonitor.vue'

const levels: Record<string, string> = {
  debug: 'grey',
  log: 'info-dark',
  info: 'info-dark',
  success: 'success-dark',
  warning: 'warning-dark',
  error: 'danger'
}
const icons: Record<string, string> = {
  debug: 'fa-solid fa-magnifying-glass',
  log: 'fa-solid fa-circle-info',
  info: 'fa-solid fa-circle-info',
  success: 'fa-solid fa-circle-check',
  warning: 'fa-solid fa-circle-exclamation',
  error: 'fa-solid fa-triangle-exclamation'
}

export default Vue.extend({
  name: 'PeerTable',
  components: {
    IsLocalMonitor
  },
  props: {
    columns: {
      type: Array,
      default () { return ['peerId', 'createdAt', 'updatedAt'] }
      // services?
    },
    healthChecks: {
      type: Array
    }
  },
  computed: {
    ...mapState(['dateTimeFormat', 'localMonitorId'])
  },
  // data () {
  //   return {
  //     columns: []
  //   }
  // },
  methods: {
    shortStash: shortStash,
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    getLevelClass (level: string) { return levels[level] || level },
    getLevelIcon (level: string) { return icons[level] || 'fa-circle-question' },
    moment: moment
  }
})
</script>
