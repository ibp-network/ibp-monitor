<template>
  <table class="table is-fullwidth">
    <thead>
      <th v-if="columns.includes('logo')"></th>
      <th v-if="columns.includes('name')">Name</th>
      <th v-if="columns.includes('endpoint')">Endpoint</th>
      <th v-if="columns.includes('status')">Status</th>
      <th v-if="columns.includes('pjs')" class="text-center">P.JS</th>
    </thead>
    <tbody>
      <tr v-for="service in services" v-bind:key="service.id" @click="gotoService(service.id)">
        <td v-if="columns.includes('logo')" style="cursor: pointer">
          <v-avatar size="x-small">
            <v-img :src="service.chain.logoUrl"></v-img>
          </v-avatar>
        </td>
        <td v-if="columns.includes('name')" style="cursor: pointer">{{ service.chain.name }}</td>
        <td v-if="columns.includes('endpoint')">{{ service.chain.id }}</td>
        <td v-if="columns.includes('status')">{{ service.status }}</td>
        <td v-if="columns.includes('pjs')" class="text-center">
          <div>
            <a
              v-for="geoDnsPool in geoDnsPools"
              v-bind:key="geoDnsPool.id"
              :href="`https://polkadot.js.org/apps/?rpc=wss://${service.membershipLevel.subdomain}.${geoDnsPool.host}/${service.chain.id}`"
              target="_blank"
            >
              IBP.{{ geoDnsPool.id }}
            </a>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import { IService } from './types'
import { useRouter } from 'vue-router'

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
        return ['logo', 'name', 'endpoint', 'status', 'pjs']
      },
    },
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    return { store, router }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('geoDnsPool', { geoDnsPools: 'list' }),
  },
  methods: {
    gotoService(serviceUrl: string) {
      console.debug('gotoService', serviceUrl)
      this.router.push(`/service/${encodeURIComponent(serviceUrl)}`)
    },
    formatDateTime(value: any): string {
      return moment(value).format(this.dateTimeFormat)
    },
  },
  created() {
    console.debug('ServiceTable.vue created', this.services)
    this.store.dispatch('geoDnsPool/getList')
  },
})
</script>
