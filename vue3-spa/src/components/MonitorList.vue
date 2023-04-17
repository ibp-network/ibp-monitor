<template>
  <v-list>
    <!-- <thead>
    <th v-if="columns.includes('monitorId')">Monitor</th>
    <th v-if="columns.includes('services')" class="has-text-centered">Services</th>
    <th>Last Seen (UTC)</th>
    <th>Discovered</th>
  </thead> -->
    <v-list-item v-for="monitor in monitors" v-bind:key="monitor.id">
      <td v-if="columns.includes('monitorId')" style="cursor: pointer">
        <a @click="gotoMonitor(monitor.id)">{{ shortStash(monitor.id) }}</a>
        <!-- <%- include(templateDir + '/isLocalMonitor.ejs', { monitorId: monitor.monitorId, localMonitorId }); -%> -->
        <sup><IsLocalMonitor :monitorId="monitor.id"></IsLocalMonitor></sup>
      </td>
      <td>{{ formatDateTime(monitor.updatedAt) }}</td>
      <td>{{ formatDateTime(monitor.createdAt) }}</td>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import IsLocalMonitor from './IsLocalMonitor.vue'
import { shortStash } from './utils'
import { IMonitor } from './types'

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
    return { store }
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
      this.$router.push(`/monitor/${monitorId}`)
    },
  },
  created() {
    console.debug('MonitorTable', 'created')
  },
})
</script>
