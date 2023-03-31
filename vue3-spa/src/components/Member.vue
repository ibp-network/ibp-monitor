<template>
  <v-container fluid class="pa-0 ma-0">

    <!-- <v-breadcrumbs>
      <v-breadcrumbs-item to="/">Home</v-breadcrumbs-item>
      <v-breadcrumbs-divider></v-breadcrumbs-divider>
      <v-breadcrumbs-item to="/member">Members</v-breadcrumbs-item>
      <v-breadcrumbs-divider></v-breadcrumbs-divider>
      <v-breadcrumbs-item><b>{{member.name}}</b></v-breadcrumbs-item>
    </v-breadcrumbs> -->
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
          <td>{{member.name}}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{member.membership}}-{{member.current_level}}</td>
        </tr>
        <tr>
          <th>Discovered</th>
          <td>{{formatDateTime(member.createdAt)}}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{{formatDateTime(member.updatedAt)}}</td>
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

    <v-tabs>
      <v-tab>Services</v-tab>
    </v-tabs>
    <ServiceTable v-if="$vuetify.display.width > 599" :services="member.services" :columns="['serviceUrl', 'name', 'pjs', 'updatedAt']"></ServiceTable>
    <ServiceList v-if="$vuetify.display.width < 600" :services="member.services"></ServiceList>
  </v-container>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
// import PeerTable from './PeerTable.vue'
// import CheckChart from './CheckChart.vue'
// import CheckTable from './CheckTable.vue'
import ServiceTable from './ServiceTable.vue'
import ServiceList from './ServiceList.vue'

export default defineComponent({
  name: 'MemberC',
  components: {
    ServiceTable,
    ServiceList
  //   PeerTable,
  //   CheckChart,
  //   CheckTable
  },
  setup () {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('member', { member: 'model' })
  },
  methods: {
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment
  },
  created () {
    console.debug(this.$route.params)
    if (this.member.memberId !== this.$route.params.memberId) {
      this.store.dispatch('member/setModel', this.$route.params.memberId)
    }
  },
  mounted () {
    this.$nextTick(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    })
  }
})
</script>
