<template>
  <v-container class="pa-1">
    <v-toolbar density="compact" class="mb-0 rounded-pill">
      <v-btn icon to="/healthCheck"><v-icon size="small">mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>{{ healthCheck?.id }} ({{ healthCheck?.serviceId }})</v-toolbar-title>
    </v-toolbar>

    <v-table class="bg-background" density="compact">
      <tbody>
        <tr>
          <th>Service</th>
          <td>
            <router-link :to="`/service/${healthCheck.serviceId}`">{{
              healthCheck.serviceId
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Member</th>
          <td style="cursor: pointer" @click="gotoMember(healthCheck.memberId)">
            {{ healthCheck.memberId }}
          </td>
        </tr>
        <tr>
          <th>Node</th>
          <td style="cursor: pointer">
            <router-link :to="`/node/${healthCheck.peerId}`">
              {{ shortStash(healthCheck.peerId) }}
            </router-link>
          </td>
        </tr>
        <tr>
          <th>Monitor</th>
          <td>
            <router-link :to="`/monitor/${healthCheck.monitorId}`">{{
              shortStash(healthCheck.monitorId)
            }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Performance</th>
          <td>{{ healthCheck.record?.performance?.toFixed(2) }} ms</td>
        </tr>
      </tbody>
    </v-table>
    <div class="tabs">
      <ul>
        <li class="is-active"><a>JSON</a></li>
      </ul>
    </div>

    <pre class="bg-background"
      >{{ healthCheckAsJSON() }}
    </pre>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'
import { shortStash } from './utils'

export default defineComponent({
  name: 'CheckC',
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('healthCheck', ['healthCheck']),
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    return { store, route, router }
  },
  methods: {
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    shortStash,
    moment: moment,
    healthCheckAsJSON() {
      return JSON.stringify(this.healthCheck, null, 4)
    },
    gotoMember(memberId: string) {
      // console.debug('gotoMember()', memberId)
      this.router.push({
        path: `/member/${memberId}`,
        params: { memberId },
        query: { tab: 'checks' },
      })
    },
  },
  created() {
    console.debug(this.route.params)
    this.store.dispatch('healthCheck/setHealthCheck', this.route.params.id)
  },
})
</script>
