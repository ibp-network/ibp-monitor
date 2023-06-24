<template>
  <v-container fluid class="pa-0 ma-0">
    <v-toolbar>
      <v-btn icon to="/member"><v-icon>mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>{{ member.name || 'Member' }}</v-toolbar-title>
      <v-btn icon>
        <v-img :src="member.logo" width="32px" height="32px"></v-img>
      </v-btn>
    </v-toolbar>

    <v-row>
      <v-col cols="8">
        <table density="compact" class="table is-bordered">
          <tbody>
            <tr>
              <th>Name</th>
              <td>{{ member.name }}</td>
            </tr>
            <tr>
              <th>Membership</th>
              <td>{{ member.membershipLevel.name }}</td>
            </tr>
            <!-- <tr>
              <th>Status</th>
              <td>{{member.status}}</td>
            </tr> -->
            <tr>
              <th>Discovered</th>
              <td>{{ formatDateTime(member.createdAt) }}</td>
            </tr>
            <tr>
              <th>Updated</th>
              <td>{{ formatDateTime(member.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </v-col>
      <v-col cols="4" fill-height class="text-center">
        <v-avatar size="96">
          <v-img :src="member.logo" width="96px" height="96px"></v-img>
        </v-avatar>
      </v-col>
    </v-row>

    <v-tabs v-model="activeTab">
      <v-tab value="performance">Performance</v-tab>
      <v-tab value="services">Provides</v-tab>
      <v-tab value="nodes">Nodes</v-tab>
      <v-tab value="checks">Healthchecks</v-tab>
    </v-tabs>

    <v-container v-show="activeTab === 'performance'">
      <CheckChart :health-checks="healthChecks" :group-by="'serviceId'"></CheckChart>
    </v-container>
    <v-container v-show="activeTab === 'services'">
      <ServiceTable
        v-if="$vuetify.display.width > 599"
        :member="member"
        :services="servicesForMember"
        :columns="['logo', 'name', 'serviceId', 'pjs']"
      ></ServiceTable>
      <ServiceList
        v-if="$vuetify.display.width < 600"
        :member="member"
        :services="servicesForMember"
      ></ServiceList>
    </v-container>
    <v-container v-show="activeTab === 'nodes'">
      <NodeTable
        :nodes="nodesForMember"
        :columns="['peerId', 'serviceId', 'updatedAt', 'createdAt']"
      ></NodeTable>
    </v-container>
    <v-container v-show="activeTab === 'checks'">
      <CheckTable
        v-if="$vuetify.display.width > 599"
        :health-checks="healthChecks"
        :columns="['id', 'serviceId', 'performance']"
      ></CheckTable>
      <CheckList v-if="$vuetify.display.width < 600" :health-checks="healthChecks"></CheckList>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import CheckChart from './CheckChart.vue'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'
import NodeTable from './NodeTable.vue'
import ServiceTable from './ServiceTable.vue'
import ServiceList from './ServiceList.vue'
import { IService } from './types'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'MemberC',
  components: {
    CheckChart,
    CheckTable,
    CheckList,
    NodeTable,
    ServiceTable,
    ServiceList,
  },
  props: {
    tab: {
      type: String,
      default: 'performance',
    },
  },
  setup(props) {
    const store = useStore()
    const propTab = props.tab
    const activeTab = ref(propTab)
    const route = useRoute()
    return { store, activeTab, route }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', { services: 'list' }),
    ...mapState('member', { member: 'model', healthChecks: 'healthChecks', nodes: 'nodes' }),
    servicesForMember() {
      return this.services.filter(
        (service: IService) => service.membershipLevel.id <= this.member.membershipLevelId
      )
    },
    nodesForMember() {
      return this.nodes
    },
  },
  methods: {
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment,
  },
  created() {
    console.debug(this.route.params)
  },
  mounted() {
    this.$nextTick(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    })
    if (this.member.id !== this.route.params.memberId) {
      this.store.dispatch('member/setModel', this.route.params.memberId)
    }
    this.store.dispatch('member/getChecks', this.member.id)
    this.store.dispatch('member/getNodes', this.member.id)
    this.activeTab = this.route.params.tab?.toString() || 'performance'
  },
})
</script>
