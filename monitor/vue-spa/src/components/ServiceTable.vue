<template>

<table class="table is-fullwidth">
  <thead>
    <th>id</th>
    <th>name</th>
    <th>status</th>
    <th>url</th>
  </thead>
  <tbody>
    <tr v-for="service in services" v-bind:key="service.serviceUrl">
      <td><a @click="gotoService(service.serviceUrl)">{{ service.serviceUrl }}</a></td>
      <td>{{service.name}}</td>
      <td>{{service.status}}</td>
      <td><a href="https://polkadot.js.org/apps/?rpc=<%= service.serviceUrl %>" target="_blank">
        {{service.serviceUrl}}
        <small><i class="fa-solid fa-arrow-up-right-from-square"></i></small>
      </a></td>
    </tr>
  </tbody>
</table>

</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  name: 'ServiceTable',
  props: {
    services: {
      type: Array
    }
  },
  // computed: {
  //   ...mapState('service', ['list'])
  // },
  methods: {
    gotoService (serviceUrl: string) {
      console.debug('gotoService', serviceUrl)
      this.$router.push(`/service/${encodeURIComponent(serviceUrl)}`)
    }
  },
  data () {
    return {
      columns: []
    }
  }
})
</script>
