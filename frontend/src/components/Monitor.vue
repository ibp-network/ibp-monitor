<template>
  <v-container class="pa-1">
    <v-toolbar density="compact" class="mb-0 rounded-pill">
      <v-btn icon to="/monitor"><v-icon size="small">mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>
        Monitor: {{ monitor.meta?.name ? `${monitor.meta?.name} ( ${shortStash(monitor.id)} )` : shortStash(monitor.id) }}
      </v-toolbar-title>
    </v-toolbar>

    <v-container>
      <v-table class="bg-background" density="compact">
        <tbody>
          <tr>
            <th>Monitor ID</th>
            <td>{{ monitor.id }}</td>
          </tr>
          <!-- <tr>
            <th>Name</th>
            <td>{{ monitor.name }}</td>
          </tr> -->
          <tr>
            <th>Meta</th>
            <td>{{ monitor.meta }}</td>
          </tr>
          <tr>
            <th>Addresses</th>
            <td>{{ monitor.multiaddress }}</td>
          </tr>
          <tr>
            <th>Updated</th>
            <td>{{ formatDateTime(monitor.updatedAt) }}</td>
          </tr>
          <tr>
            <th>Discovered</th>
            <td>{{ formatDateTime(monitor.createdAt) }}</td>
          </tr>
        </tbody>
      </v-table>

      <v-tabs v-model="tab">
        <v-tab value="checks">Checks</v-tab>
        <v-tab value="config" v-show="monitor.id === localMonitorId">Config</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="checks">
          <CheckTable
            v-if="$vuetify.display.width > 599"
            :healthChecks="monitor.healthChecks"
            :columns="['id', 'serviceId', 'memberId', 'version', 'performance', 'updatedAt']"
          ></CheckTable>
          <CheckList v-if="$vuetify.display.width < 600" :healthChecks="monitor.healthChecks"></CheckList>
        </v-window-item>
        <v-window-item value="config">
          <pre class="bg-background">{{ config }}</pre>
        </v-window-item>
      </v-window>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { mapState, useStore } from 'vuex'
import { useRoute } from 'vue-router'
import moment from 'moment'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'
// import ServiceTable from './ServiceTable.vue'
// import ServiceList from './ServiceList.vue'
import { shortStash } from './utils'

export default defineComponent({
  name: 'ServiceC',
  components: {
    // ServiceTable,
    // ServiceList,
    CheckTable,
    CheckList,
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const tab = ref('checks')
    return { store, route, tab }
  },
  computed: {
    ...mapState(['dateTimeFormat', 'localMonitorId', 'config']),
    ...mapState('monitor', ['monitor']),
  },
  methods: {
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment,
    shortStash,
  },
  created() {
    console.debug(this.route.params)
    this.store.dispatch('monitor/setMonitor', this.route.params.monitorId)
  },
})
</script>
