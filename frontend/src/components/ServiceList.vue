<template>
  <v-list density="compact">
    <v-list-item
      v-for="service in services"
      v-bind:key="service.id"
      @click="gotoService(service.id)"
      style="cursor: pointer"
    >
      <template v-slot:prepend>
        <v-avatar size="small">
          <v-img :src="service.chain.logoUrl"></v-img>
        </v-avatar>
      </template>
      <v-list-item-title>
        {{ service.chain.name }}
        <v-icon color="success" v-if="service.status === 'active'">mdi-check-circle-outline</v-icon>
      </v-list-item-title>
      <v-list-item-subtitle>
        <v-icon v-if="service.chain.relayChainId != null">mdi-link</v-icon>
        {{ service.chain.relayChainId ? 'on' : '' }} {{ service.chain.relayChainId }}
      </v-list-item-subtitle>

      <template v-slot:append>
        <v-menu v-if="service.status === 'active'">
          <template v-slot:activator="{ props }">
            <v-btn icon elevation="0" v-bind="props">
              <v-icon>mdi-link-variant</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="geoDnsPool in geoDnsPools" v-bind:key="geoDnsPool.id">
              <a
                @click.stop
                :href="`https://polkadot.js.org/apps/?rpc=wss://${service.membershipLevel.subdomain}.${geoDnsPool.host}/${service.chain.id}`"
                target="_blank"
              >
                IBP.{{ geoDnsPool.id }} <sup><v-icon size="x-small">mdi-open-in-new</v-icon></sup>
              </a>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IMember, IService } from './types'
import { mapState, useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ServiceList',
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
      default() {
        return ['memberId', 'createdAt', 'updatedAt']
      },
      // services?
    },
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    return { store, router }
  },
  computed: {
    ...mapState('geoDnsPool', { geoDnsPools: 'list' }),
  },
  methods: {
    gotoService(serviceUrl: string) {
      console.debug('gotoService', serviceUrl)
      this.router.push(`/service/${encodeURIComponent(serviceUrl)}`)
    },
  },
  created() {
    console.debug('ServiceTable.vue created', this.services)
    this.store.dispatch('geoDnsPool/getList')
  },
})
</script>

<style scoped>
.custom {
  min-height: 63px;
}
</style>
