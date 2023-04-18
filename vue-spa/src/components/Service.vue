<template>
  <v-container fluid class="pa-0 ma-0">
    <v-toolbar>
      <v-btn icon to="/service"><v-icon>mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>{{ service.name || 'Service' }}</v-toolbar-title>
    </v-toolbar>

    <table class="table is-fullwidth" v-if="service.chain">
      <tbody>
        <tr>
          <th>Name</th>
          <td>{{ service.chain.name }}</td>
        </tr>
        <tr>
          <th>Level Required</th>
          <td>{{ service.membershipLevelId }}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{ service.status }}</td>
        </tr>
        <tr v-if="service.chain.relayChainId">
          <th>Parachain</th>
          <td>
            Yes (on:
            <a @click="gotoService(service.chain.relayChainId)">{{ service.chain.relayChainId }}</a
            >)
          </td>
        </tr>
        <tr v-if="service.status === 'active'">
          <th>Polkadot.js</th>
          <td>
            <div v-for="geoDnsPool in geoDnsPools" v-bind:key="geoDnsPool.id">
              <a
                :href="`https://polkadot.js.org/apps/?rpc=wss://${service.membershipLevel.subdomain}.${geoDnsPool.host}/${service.chain.id}`"
                target="_blank"
              >
                wss://{{ service.membershipLevel.subdomain }}.{{ geoDnsPool.host }}/{{
                  service.chain.id
                }}
              </a>
              (level: {{ service.membershipLevelId }})
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <v-tabs v-model="activeTab">
      <v-tab value="performance">Performance</v-tab>
      <v-tab value="members">Providers</v-tab>
      <v-tab value="nodes">Nodes</v-tab>
      <v-tab value="checks">HealthChecks</v-tab>
    </v-tabs>

    <!-- <v-window v-model="activeTab" direction="false">
    <v-window-item value="performance"> -->
    <v-container v-show="activeTab === 'performance'">
      <a :href="`/api/metrics/${service.id}`" target="_blank">
        Prometheus &nbsp;<img src="/image/prometheus-logo-orange.svg" alt="" width="18px" />
      </a>
      <CheckChart :healthChecks="service.healthChecks" :group-by="'memberId'"></CheckChart>
    </v-container>
    <!-- </v-window-item>
    <v-window-item value="members"> -->
    <v-container v-show="activeTab === 'members'">
      <MemberList :list="membersForService"></MemberList>
    </v-container>
    <!-- </v-window-item>
    <v-window-item value="checks"> -->
    <v-container v-show="activeTab === 'nodes'">
      <NodeTable
        :nodes="service.nodes"
        :columns="['peerId', 'memberId', 'updatedAt', 'createdAt']"
      ></NodeTable>
    </v-container>
    <v-container v-show="activeTab === 'checks'">
      <CheckTable
        v-if="$vuetify.display.width > 599"
        :healthChecks="service.healthChecks"
        :columns="['id', 'monitorId', 'memberId', 'source', 'version', 'performance', 'createdAt']"
      ></CheckTable>
      <CheckList
        v-if="$vuetify.display.width < 600"
        :healthChecks="service.healthChecks"
      ></CheckList>
      <!-- </v-window-item>
    </v-window> -->
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import MemberList from './MemberList.vue'
import MemberTable from './MemberTable.vue'
import CheckChart from './CheckChart.vue'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'
import NodeTable from './NodeTable.vue'
import MonitorTable from './MonitorTable.vue'
import MonitorList from './MonitorList.vue'
import { IMember } from './types'

export default defineComponent({
  name: 'ServiceC',
  components: {
    CheckChart,
    CheckTable,
    CheckList,
    NodeTable,
    MemberList,
    MemberTable,
    MonitorTable,
    MonitorList,
  },
  setup() {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', ['service']),
    ...mapState('member', { members: 'list' }),
    ...mapState('geoDnsPool', { geoDnsPools: 'list' }),
    membersForService(): IMember[] {
      return this.members.filter(
        (m: IMember) => m.membershipLevelId >= this.service.membershipLevelId
      )
    },
  },
  watch: {
    service(newVal) {
      console.debug('watch.service', newVal)
    },
  },
  methods: {
    gotoService(serviceId: string) {
      this.store.dispatch('service/setService', serviceId)
      this.$router.push(`/service/${serviceId}`)
    },
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment,
  },
  data() {
    return {
      activeTab: 'performance',
    }
  },
  created() {
    console.debug(this.$route.params)
    this.store.dispatch('service/setService', this.$route.params.serviceId)
    this.store.dispatch('geoDnsPool/getList')
  },
  mounted() {
    this.$nextTick(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    })
  },
})
</script>
