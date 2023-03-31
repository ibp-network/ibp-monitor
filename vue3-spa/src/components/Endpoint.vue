<template>
  <v-container fluid class="pa-0 ma-0">

    <v-toolbar>
      <v-btn icon to="/service"><v-icon>mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>{{ service.serviceUrl || 'Endpoint' }}</v-toolbar-title>
    </v-toolbar>

    <table class="table is-fullwidth">
      <tbody>
        <tr>
          <th>Name</th>
          <td>{{service.name}}</td>
        </tr>
        <tr>
          <th>Url</th>
          <td>{{service.serviceUrl}}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{service.status}}</td>
        </tr>
        <tr>
          <th>Member</th>
          <td><router-link :to="`/member/${service.memberId}`">{{service.memberId}}</router-link></td>
        </tr>
        <tr>
          <th>Error count</th>
          <td>{{service.errorCount}}</td>
        </tr>
        <tr>
          <th>Polkadot.js</th>
          <td><a :href="`https://polkadot.js.org/apps/?rpc=${service.serviceUrl}`" target="_blank">
            {{service.serviceUrl}}
            <sup><small><i class="fa-solid fa-arrow-up-right-from-square"></i></small></sup>
          </a></td>
        </tr>
        <tr>
          <th>Discovered</th>
          <td>{{formatDateTime(service.createdAt)}}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{{formatDateTime(service.updatedAt)}}</td>
        </tr>
      </tbody>
    </table>

    <v-row>
      <v-col class="col-6 col-sm-12">
        <v-tabs>
          <v-tab>Monitors</v-tab>
        </v-tabs>
        <MonitorTable v-if="$vuetify.display.width > 599" :monitors="service.monitors" :columns="['monitorId', 'updatedAt']"></MonitorTable>
        <MonitorList v-if="$vuetify.display.width < 600" :monitors="service.monitors"></MonitorList>
      </v-col>
      <v-col class="col-6 col-sm-12">
        <v-tabs>
          <v-tab>Peers</v-tab>
        </v-tabs>
        <PeerTable :peers="service.peers" :columns="['id', 'serviceUrl', 'status', 'peerId', 'updatedAt']"></PeerTable>
      </v-col>
    </v-row>

    <v-tabs>
      <v-tab>Performance</v-tab>
      <v-tab>
        <router-link :to="`/api/metrics/${encodeURIComponent(service.serviceUrl)}`" target="_blank">
            Prometheus
            &nbsp;<img src="/image/prometheus_logo_orange.svg" alt="" width="18px">
          </router-link>
      </v-tab>
    </v-tabs>

    <!-- <%- include(templateDir + '/checksChart.ejs', { healthChecks }); -%> -->
    <CheckChart :healthChecks="service.healthChecks"></CheckChart>

    <v-tabs>
      <v-tab>
        Checks
      </v-tab>
    </v-tabs>
    <!-- <%- include(templateDir + '/checksTable.ejs', { healthChecks }); -%> -->
    <CheckTable v-if="$vuetify.display.width > 599" :healthChecks="service.healthChecks" :columns="['id', 'monitorId', 'source', 'version', 'performance', 'updatedAt']"></CheckTable>
    <CheckList v-if="$vuetify.display.width < 600" :healthChecks="service.healthChecks"></CheckList>

  </v-container>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import PeerTable from './PeerTable.vue'
import CheckChart from './CheckChart.vue'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'
import MonitorTable from './MonitorTable.vue'
import MonitorList from './MonitorList.vue'

export default defineComponent({
  name: 'ServiceC',
  components: {
    MonitorTable,
    MonitorList,
    PeerTable,
    CheckChart,
    CheckTable,
    CheckList
  },
  setup () {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', ['service'])
  },
  methods: {
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment
  },
  created () {
    console.debug(this.$route.params)
    this.store.dispatch('service/setService', this.$route.params.serviceUrl)
  },
  mounted () {
    this.$nextTick(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    })
  }
})
</script>
