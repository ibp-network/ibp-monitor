<template>
  <table class="table is-fullwidth table-container">
    <thead>
      <th v-if="columns.includes('id')">Monitor</th>
      <th>Last Seen (UTC)</th>
      <th>Discovered</th>
    </thead>
    <tbody>
      <tr v-for="monitor in monitors" v-bind:key="monitor.id">
        <td v-if="columns.includes('id')" style="cursor: pointer">
          <a @click="gotoMonitor(monitor.id)">{{ shortStash(monitor.id) }}</a>
          <!-- <%- include(templateDir + '/isLocalMonitor.ejs', { monitorId: monitor.monitorId, localMonitorId }); -%> -->
          <sup><IsLocalMonitor :monitorId="monitor.id"></IsLocalMonitor></sup>
        </td>
        <td>{{ formatDateTime(monitor.updatedAt) }}</td>
        <td>{{ formatDateTime(monitor.createdAt) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import IsLocalMonitor from './IsLocalMonitor.vue'
import { shortStash } from './utils'
import { IMonitor } from './types'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'MonitorTable',
  components: {
    IsLocalMonitor,
  },
  props: {
    monitors: {
      // type: Array
      type: Object as PropType<[IMonitor]>,
    },
    columns: {
      type: Array,
      default() {
        return ['id', 'createdAt', 'updatedAt']
      },
      // services?
    },
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    return { store, router }
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
      await this.store.dispatch('monitor/setMonitor', monitorId)
      this.router.push(`/monitor/${monitorId}`)
    },
  },
  created() {
    console.debug('MonitorTable', 'created')
  },
})
</script>
