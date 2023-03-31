<template>

<table class="table is-fullwidth">
  <thead>
    <th v-if="columns.includes('serviceUrl')">Service URL</th>
    <th v-if="columns.includes('name')">Name</th>
    <th v-if="columns.includes('memberId')">MemberId</th>
    <th v-if="columns.includes('memberLink')">Member</th>
    <th v-if="columns.includes('status')">Status</th>
    <th v-if="columns.includes('pjs')">P.JS</th>
    <th v-if="columns.includes('monitors')">Monitors</th>
    <th v-if="columns.includes('errors')">Errors</th>
    <th v-if="columns.includes('updated')">Updated</th>
  </thead>
  <tbody>
    <tr v-for="service in services" v-bind:key="service.serviceUrl">
      <td v-if="columns.includes('serviceUrl')"><a @click="gotoService(service.serviceUrl)">{{ service.serviceUrl }}</a></td>
      <td v-if="columns.includes('name')">{{service.name}}</td>
      <td v-if="columns.includes('memberId')">{{service.memberId}}</td>
      <td v-if="columns.includes('memberLink')">
        <router-link :to="`/member/${service.memberId}`">{{service.memberId}}</router-link>
      </td>
      <td v-if="columns.includes('status')">{{service.status}}</td>
      <td v-if="columns.includes('pjs')"><a :href="`https://polkadot.js.org/apps/?rpc=${service.serviceUrl}`" target="_blank">
        <!-- {{service.serviceUrl}} -->
        polkadot.js
        <small><i class="fa-solid fa-arrow-up-right-from-square"></i></small>
      </a></td>
      <td v-if="columns.includes('monitors')">{{service.monitors?.length || 0}}</td>
      <td v-if="columns.includes('errors')">{{service.errorCount || 0}}</td>
      <td v-if="columns.includes('updated')">{{formatDateTime(service.updatedAt)}}</td>
    </tr>
  </tbody>
</table>

</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { mapState } from 'vuex'

export default defineComponent({
  name: 'ServiceTable',
  props: {
    services: {
      type: Array
    },
    columns: {
      type: Array,
      default () { return ['memberId', 'createdAt', 'updatedAt'] }
      // services?
    }
  },
  methods: {
    gotoService (serviceUrl: string) {
      console.debug('gotoService', serviceUrl)
      this.$router.push(`/service/${encodeURIComponent(serviceUrl)}`)
    }
  },
  created () {
    console.debug('ServiceTable.vue created', this.services)
  }
})
</script>
