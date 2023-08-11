<template>
  <v-container class="pa-1">
    <v-toolbar density="compact" class="mb-0 rounded-pill">
      <v-btn icon to="/member"><v-icon>mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>Member: {{ member.name || 'Member' }}</v-toolbar-title>
      <v-btn icon :href="member.websiteUrl">
        <v-img :src="member.logoUrl" width="32px" height="32px"></v-img>
      </v-btn>
    </v-toolbar>

    <v-container>
      <v-row>
        <v-col>
          <v-table density="compact" class="bg-background is-bordered full-width" style="width: 100%">
            <tbody>
              <tr>
                <th>Name</th>
                <td>{{ member.name || '' }}</td>
              </tr>
              <tr>
                <th>Membership</th>
                <td>{{ member.membershipType }}
                  {{ member.membershipLevel?.id }}</td>
              </tr>
              <!-- <tr>
                <th>Status</th>
                <td>{{member.status}}</td>
              </tr> -->
              <tr>
                <th>Website</th>
                <td>
                  <a :href="member.websiteUrl" target="_blank">{{ member.websiteUrl }} <sup><v-icon size="x-small">mdi-open-in-new</v-icon></sup></a>
                </td>
              </tr>
              <tr>
                <th>Monitor</th>
                <td>
                  <a :href="member.monitorUrl" target="_blank">{{ member.monitorUrl }} <sup><v-icon size="x-small">mdi-open-in-new</v-icon></sup></a>
                </td>
              </tr>
              <tr>
                <th>Discovered</th>
                <td>{{ formatDateTime(member.createdAt) }}</td>
              </tr>
              <tr>
                <th>Updated</th>
                <td>{{ formatDateTime(member.updatedAt) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <!-- <v-col cols="4" fill-height class="text-center">
          <v-avatar size="96">
            <v-img :src="member.logoUrl" width="64px" height="64px"></v-img>
          </v-avatar>
        </v-col> -->
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
          :columns="['id', 'serviceId', 'source', 'monitorId', 'performance']"
        ></CheckTable>
        <CheckList v-if="$vuetify.display.width < 600" :health-checks="healthChecks"></CheckList>
      </v-container>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import moment from 'moment'
import CheckChart from './CheckChart.vue'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'
import NodeTable from './NodeTable.vue'
import ServiceTable from './ServiceTable.vue'
import ServiceList from './ServiceList.vue'
import { IService } from './types'

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
    const route = useRoute()

    const memberId =route.params.memberId.toString()
    const member = computed(() => store.state.member.model)

    const dateTimeFormat = computed(() => store.state.dateTimeFormat)
    const services = computed<IService[]>(() => store.state.service.list)
    const healthChecks = computed(() => store.state.member.healthChecks)
    const nodes = computed<any[]>(() => store.state.member.nodes)

    // const propTab = computed(() => route.params.tab?.toString() || props.tab)
    var activeTab = ref(route.params.tab?.toString() || props.tab)

    const servicesForMember = computed(() => {
      return services.value.filter(
        (service: IService) => service.membershipLevel.id <= member.value.membershipLevelId
      )
    })
    const nodesForMember = computed(() => {
      return nodes.value
    })

    onBeforeMount(async () => {
      if (member.value.id !== memberId) {
        await store.dispatch('member/setModel', memberId)
        await store.dispatch('member/getChecks', memberId)
        await store.dispatch('member/getNodes', memberId)
      } else {
        await store.dispatch('member/getChecks', member.value.id)
        await store.dispatch('member/getNodes', member.value.id)
      }
    })

    return {
      dateTimeFormat, member, services, healthChecks, nodes, activeTab, route,
      servicesForMember,
      nodesForMember,
    }
  },
  methods: {
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment,
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
