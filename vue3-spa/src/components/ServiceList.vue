<template>
  <v-list density="compact">
    <v-list-item v-for="service in services" v-bind:key="service.serviceUrl"
      @click="gotoService(service.serviceUrl)" style="cursor: pointer;">

      <v-list-item-title>
        {{service.name}}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ service.serviceUrl }}
      </v-list-item-subtitle>
      <td v-if="columns.includes('serviceUrl')" style="cursor: pointer"><a @click="gotoService(service.serviceUrl)">{{ service.serviceUrl }}</a></td>
      <td>{{service.status}}</td>
      <td></td>
      <td>{{service.monitors?.length}}</td>
      <td>{{service.errorCount || 0}}</td>
      <!-- <td>{{formatDateTime(service.updatedAt)}}</td> -->
      <template v-slot:append>
        <v-container class="ma-0 pa-0 fill-height custom">
          <a @click.stop  :href="`https://polkadot.js.org/apps/?rpc=${service.serviceUrl}`" target="_blank">
            <!-- {{service.serviceUrl}} -->
            p.js
            <small><i class="fa-solid fa-arrow-up-right-from-square"></i></small>
          </a>
        </v-container>
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { ref, defineComponent, PropType } from 'vue'
import { mapState } from 'vuex'
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

<style scoped>
.custom {
  min-height: 63px;
}
</style>