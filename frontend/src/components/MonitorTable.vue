<template>
  <v-table class="bg-background">
    <!-- {{ peers }} -->
    <thead>
      <th v-if="columns.includes('id')" class="pl-4">Monitor</th>
      <th class="text-center">Connected</th>
      <th class="text-center">Last Seen (UTC)</th>
      <th class="text-center">Discovered</th>
    </thead>
    <tbody>
      <tr v-for="monitor in monitors" v-bind:key="monitor.id">
        <td v-if="columns.includes('id')" style="cursor: pointer">
          <!-- <a @click="gotoMonitor(monitor.id)">
            {{ monitor.meta?.name ? monitor.meta.name : shortStash(monitor.id) }}
          </a> -->
          <router-link :to="`/monitor/${monitor.id}`">
            {{ monitor.meta?.name ? monitor.meta.name : shortStash(monitor.id) }}
            <sup><IsLocalMonitor :monitorId="monitor.id"></IsLocalMonitor></sup>
          </router-link>
        </td>
        <td class="text-center">
          {{ connection(monitor.id) }}
        </td>
        <!-- <td>{{ formatDateTime(monitor.updatedAt) }}</td> -->
        <td class="text-center">{{ moment(monitor.updatedAt).fromNow() }}</td>
        <!-- <td>{{ formatDateTime(monitor.createdAt) }}</td> -->
        <td class="text-center">{{ moment(monitor.createdAt).fromNow() }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import { useRouter } from 'vue-router'
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
    peers: {
      type: Object as PropType<[string]>,
      default() {
        return [] as PropType<[string]>
      },
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
    ...mapState(['dateTimeFormat', 'localMonitorId']),
  },
  methods: {
    shortStash,
    moment,
    connection(monitorId: string) {
      if (this.peers.includes(monitorId)) return '🟢';
      if (this.localMonitorId === monitorId) return '🔵';
      return '🟠';
    },
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
