<template>
  <v-list density="compact">
    <v-list-item v-for="service in services" v-bind:key="service.id"
      @click="gotoService(service.id)" style="cursor: pointer;">

      <template v-slot:prepend>
        <v-avatar size="small">
          <v-img :src="service.logo"></v-img>
        </v-avatar>
      </template>
      <v-list-item-title>
        {{service.name}} <v-icon color="success" v-if="service.status==='active'">mdi-check-circle-outline</v-icon>
      </v-list-item-title>
      <v-list-item-subtitle>
        <v-icon v-if="service.parachain">mdi-link</v-icon>
        {{ service.parachain ? 'on' : '' }} {{ service.parentId }}
      </v-list-item-subtitle>
      <!-- <td>{{service.status}}</td> -->
      
      <template v-slot:append>
        <v-menu v-if="service.status==='active'">
          <template v-slot:activator="{ props }">
            <v-btn icon elevation="0" v-bind="props">
              <v-icon>mdi-link-variant</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <a @click.stop :href="`https://polkadot.js.org/apps/?rpc=wss://rpc.dotters.network/${service.endpoint}`" target="_blank">
              IBP 1 <sup><v-icon size="x-small">mdi-open-in-new</v-icon></sup>
              </a>
            </v-list-item>
            <v-list-item>
              <a @click.stop :href="`https://polkadot.js.org/apps/?rpc=wss://rpc.ibp.network/${service.endpoint}`" target="_blank">
              IBP 2 <sup><v-icon size="x-small">mdi-open-in-new</v-icon></sup>
              </a>
            </v-list-item>
            <v-list-item v-show="memberServiceUrl(service.id)">
              <a @click.stop :href="`https://polkadot.js.org/apps/?rpc=${memberServiceUrl(service.id)}`" target="_blank">
              Direct<sup><v-icon size="x-small">mdi-open-in-new</v-icon></sup>
              </a>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { ref, defineComponent, PropType } from 'vue'
import { mapState } from 'vuex'
import { IMember, IService, IEndpoint } from './types'

export default defineComponent({
  name: 'ServiceTable',
  props: {
    services: {
      // type: Array
      type: Object as PropType<[IService]>, 
    },
    member: {
      type: Object as PropType<IMember>,
    },
    columns: {
      type: Array,
      default () { return ['memberId', 'createdAt', 'updatedAt'] }
      // services?
    }
  },
  methods: {
    memberServiceUrl(serviceId: string): string | undefined {
      console.debug('memberServiceUrl', serviceId, this.member)

      return this.member?.id 
        ? this.member.endpoints.find((f: IEndpoint) => f.serviceId === serviceId)?.serviceUrl
        : undefined
    },
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