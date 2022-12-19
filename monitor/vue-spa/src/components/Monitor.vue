<template>
  <section class="section">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/monitor">Monitors</router-link></li>
        <li class="is-active">&nbsp;&nbsp;{{monitor.monitorId}}</li>
      </ul>
    </nav>
    <table class="table is-bordered">
      <tbody>
        <tr>
          <th>Monitor ID</th>
          <td>{{monitor.monitorId}}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{{monitor.name}}</td>
        </tr>
        <tr>
          <th>Addresses</th>
          <td>{{monitor.multiaddrs}}</td>
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
          <td>{{formatDateTime(monitor.updatedAt)}}</td>
        </tr>
        <tr>
          <th>Discovered</th>
          <td>{{formatDateTime(monitor.createdAt)}}</td>
        </tr>
      </tbody>
    </table>

    <div class="tabs">
      <ul>
        <li class="is-active"><a>Services</a></li>
      </ul>
    </div>
    <!-- <%- include(templateDir + '/servicesTable.ejs', { services: monitor.services, columns: [] }); -%> -->
    <ServiceTable :services="monitor.services" :columns="['id','serviceUrl']"></ServiceTable>

    <div class="tabs">
      <ul>
        <li class="is-active"><a>Checks</a></li>
      </ul>
    </div>
    <!-- <%- include(templateDir + '/checksTable.ejs', { healthChecks }); -%> -->
    <CheckTable :healthChecks="monitor.healthChecks" :columns="['id', 'serviceUrl', 'source', 'version', 'performance', 'updatedAt']"></CheckTable>

  </section>

</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import CheckTable from './CheckTable.vue'
import ServiceTable from './ServiceTable.vue'

export default Vue.extend({
  name: 'ServiceC',
  components: {
    ServiceTable,
    CheckTable
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('monitor', ['monitor'])
  },
  methods: {
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment
  },
  created () {
    console.debug(this.$route.params)
    this.$store.dispatch('monitor/setMonitor', this.$route.params.monitorId)
  }
})
</script>
