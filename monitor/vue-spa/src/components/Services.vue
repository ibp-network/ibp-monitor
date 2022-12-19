<template>
  <section class="section">
    <nav class="level">
      <div class="level-left">
        <nav class="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li class="is-active">&nbsp;&nbsp;Services</li>
          </ul>
        </nav>
      </div>
    </nav>

    <!-- <ServiceTable></ServiceTable> -->
    <table class="table is-fullwidth">
      <thead>
        <th>Service url</th>
        <th>P.JS</th>
        <th>Name</th>
        <th>Status</th>
        <th>Monitors</th>
        <th>Errors</th>
        <th>Updated</th>
        <th>Discovered</th>
      </thead>

      <tbody>
        <tr v-for="service in list" v-bind:key="service.serviceUrl">
          <td><router-link :to="`/service/${encodeURIComponent(service.serviceUrl)}`">{{service.serviceUrl}}</router-link></td>
          <td><a :href="`https://polkadot.js.org/apps/?rpc=${service.serviceUrl}`" target="_blank">
            {{service.serviceUrl}}
            <small><i class="fa-solid fa-arrow-up-right-from-square"></i></small>
          </a></td>
          <td>{{service.name}}</td>
          <td>{{service.status}}</td>
          <td>{{service.monitors?.length || 0}}</td>
          <td>{{service.errorCount || 0}}</td>
          <td>{{formatDateTime(service.updatedAt)}}</td>
          <td>{{formatDateTime(service.createdAt)}}</td>
        </tr>
      </tbody>
    </table>

  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
// import ServiceTable from './ServiceTable.vue'

export default Vue.extend({
  name: 'ServicesC',
  components: {
    // ServiceTable
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', ['list'])
  },
  methods: {
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    }
  },
  mounted () {
    this.$store.dispatch('service/getList')
  }
})
</script>
