<template>
  <!-- <v-container fluid class="ma-0 pa-0"> -->
    <v-table class="bg-background">
      <thead>
        <th v-if="columns.includes('logo')"></th>
        <th v-if="columns.includes('name')">Name</th>
        <th v-if="columns.includes('endpoint')">Endpoint</th>
        <th v-if="columns.includes('status')">Status</th>
        <th v-if="columns.includes('pjs')" class="text-center">polkadot.js</th>
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
          <td v-if="columns.includes('status')" :class="`status service.status`">{{ service.status }}</td>
          <td v-if="columns.includes('pjs')" class="text-center">
            <div>
              <v-btn flat size="small"
                v-for="geoDnsPool in geoDnsPools"
                v-bind:key="geoDnsPool.id"
                :href="`https://polkadot.js.org/apps/?rpc=wss://${service.membershipLevel.subdomain}.${geoDnsPool.host}/${service.chain.id}`"
                target="_blank"
                @click.stop="openPJS"
              >
                IBP.{{ geoDnsPool.id }}
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  <!-- </v-container> -->
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import { useRouter } from 'vue-router'
import moment from 'moment'
import { IService } from './types'

export default defineComponent({
  name: 'ServiceTable',
  props: {
    services: {
      // type: Array
      type: Object as PropType<IService[]>,
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
    openPJS(event: any) {
      console.debug('openPJS')
      // window.open(event.currentTarget.href, '_blank');
    },
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

<style>
th {
  text-align: left;
  padding-left: 15px;
}
</style>