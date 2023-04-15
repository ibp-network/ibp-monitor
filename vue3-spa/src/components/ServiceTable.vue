<template>
  <table class="table is-fullwidth">
    <thead>
      <th v-if="columns.includes('logo')"></th>
      <th v-if="columns.includes('name')">Name</th>
      <th v-if="columns.includes('serviceId')">Service Id</th>
      <th v-if="columns.includes('status')">Endpoint</th>
      <th v-if="columns.includes('status')">Status</th>
      <th v-if="columns.includes('pjs')" colspan="2" class="text-center">P.JS</th>
    </thead>
    <tbody>
      <tr v-for="service in services" v-bind:key="service.id" @click="gotoService(service.id)">
        <td v-if="columns.includes('logo')" style="cursor: pointer">
          <v-avatar size="x-small">
            <v-img :src="service.logo"></v-img>
          </v-avatar>
        </td>
        <td v-if="columns.includes('name')" style="cursor: pointer">{{ service.name }}</td>
        <td v-if="columns.includes('serviceId')" style="cursor: pointer">{{ service.id }}</td>
        <td v-if="columns.includes('endpoint')">{{ service.endpoint }}</td>
        <td v-if="columns.includes('status')">{{ service.status }}</td>

        <td v-if="columns.includes('pjs')">
          <a
            v-if="service.status === 'active'"
            @click.stop
            :href="`https://polkadot.js.org/apps/?rpc=wss://rpc.dotters.network/${service.endpoint}`"
            target="_blank"
          >
            IBP.1
            <!-- <small><i class="fa-solid fa-arrow-up-right-from-square"></i></small> -->
          </a>
        </td>
        <td>
          <a
            v-if="service.status === 'active'"
            @click.stop
            :href="`https://polkadot.js.org/apps/?rpc=wss://rpc.ibp.network/${service.endpoint}`"
            target="_blank"
            >IBP.2</a
          >
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { ref, defineComponent, PropType } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import { IService } from './types'

export default defineComponent({
  name: 'ServiceTable',
  props: {
    services: {
      // type: Array
      type: Object as PropType<[IService]>,
    },
    columns: {
      type: Array,
      default() {
        return ['memberId', 'createdAt', 'updatedAt']
      },
      // services?
    },
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('domain', { domains: 'list' }),
  },
  methods: {
    gotoService(serviceUrl: string) {
      console.debug('gotoService', serviceUrl)
      this.$router.push(`/service/${encodeURIComponent(serviceUrl)}`)
    },
    formatDateTime(value: any): string {
      return moment(value).format(this.dateTimeFormat)
    },
  },
  created() {
    console.debug('ServiceTable.vue created', this.services)
  },
})
</script>
