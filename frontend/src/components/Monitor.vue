<template>
  <v-container fluid class="ma-0 pa-0">
    <!-- <v-breadcrumbs>
      <v-breadcrumbs-item to="/">Home</v-breadcrumbs-item>
      <v-breadcrumbs-divider></v-breadcrumbs-divider>
      <v-breadcrumbs-item to="/monitor">Monitors</v-breadcrumbs-item>
      <v-breadcrumbs-divider></v-breadcrumbs-divider>
      <v-breadcrumbs-item><b>{{monitor.monitorId}}</b></v-breadcrumbs-item>
    </v-breadcrumbs> -->
    <v-toolbar>
      <v-btn icon to="/monitor"><v-icon size="small">mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>{{ shortStash(monitor.monitorId) }}</v-toolbar-title>
    </v-toolbar>
    <div class="offset-1">
    <table class="table table-container">
      <tbody>
        <tr>
          <th>Monitor ID</th>
          <td>{{ monitor.id }}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{{ monitor.name }}</td>
        </tr>
        <tr>
          <th>Addresses</th>
          <td>{{ monitor.multiaddress }}</td>
        </tr>
        <!-- <tr>
          <th>Polkadot.js</th>
          <td><a :href="`https://polkadot.js.org/apps/?rpc=${monitor.monitorId}`" target="_blank">
            {{monitor.monitorId}}
            <sup><small><i class="fa-solid fa-arrow-up-right-from-square"></i></small></sup>
          </a></td>
        </tr> -->
        <tr>
          <th>Updated</th>
          <td>{{ formatDateTime(monitor.updatedAt) }}</td>
        </tr>
        <tr>
          <th>Discovered</th>
          <td>{{ formatDateTime(monitor.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <v-tabs>
      <v-tab>Checks</v-tab>
    </v-tabs>
    <!-- <%- include(templateDir + '/checksTable.ejs', { healthChecks }); -%> -->
    <CheckTable
      v-if="$vuetify.display.width > 599"
      :healthChecks="monitor.healthChecks"
      :columns="['id', 'serviceUrl', 'source', 'version', 'performance', 'updatedAt']"
    ></CheckTable>
    <CheckList v-if="$vuetify.display.width < 600" :healthChecks="monitor.healthChecks"></CheckList>
  </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'
import ServiceTable from './ServiceTable.vue'
import ServiceList from './ServiceList.vue'
import { shortStash } from './utils'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'ServiceC',
  components: {
    ServiceTable,
    ServiceList,
    CheckTable,
    CheckList,
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    return { store, route }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
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
