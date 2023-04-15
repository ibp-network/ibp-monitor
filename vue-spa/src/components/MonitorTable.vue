<template>
  <table class="table is-fullwidth">
    <thead>
      <th v-if="columns.includes('monitorId')">Monitor</th>
      <th v-if="columns.includes('services')" class="has-text-centered">Services</th>
      <th>Last Seen (UTC)</th>
      <th>Discovered</th>
    </thead>
    <tbody>
      <tr v-for="monitor in monitors" v-bind:key="monitor.monitorId">
        <td v-if="columns.includes('monitorId')">
          <a @click="gotoMonitor(monitor.monitorId)">{{ shortStash(monitor.monitorId) }}</a>
          <!-- <%- include(templateDir + '/isLocalMonitor.ejs', { monitorId: monitor.monitorId, localMonitorId }); -%> -->
          <sup><IsLocalMonitor :monitorId="monitor.monitorId"></IsLocalMonitor></sup>
        </td>
        <td v-if="columns.includes('services')" class="has-text-centered">
          {{ monitor.services?.length || 0 }}
        </td>
        <td>{{ formatDateTime(monitor.updatedAt) }}</td>
        <td>{{ formatDateTime(monitor.createdAt) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import IsLocalMonitor from './IsLocalMonitor.vue'
import { shortStash } from './utils'

export default defineComponent({
  name: 'MonitorTable',
  components: {
    IsLocalMonitor,
  },
  props: {
    monitors: {
      type: Array,
    },
    columns: {
      type: Array,
      default() {
        return ['monitorId', 'createdAt', 'updatedAt']
      },
      // services?
    },
  },
  computed: {
    ...mapState(['dateTimeFormat']),
  },
  methods: {
    shortStash,
    moment,
    formatDateTime(value: any) {
      return moment.utc(value).format(this.dateTimeFormat)
    },
    async gotoMonitor(monitorId: string) {
      await this.$store.dispatch('monitor/setMonitor', monitorId)
      this.$router.push(`/monitor/${monitorId}`)
    },
  },
  created() {
    console.debug('MonitorTable', 'created')
  },
})
</script>
