<template>
  <v-container fluid class="ma-0 pa-0">

    <!-- <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/healthCheck">Checks</router-link></li>
        <li class="is-active">&nbsp;&nbsp;{{healthCheck.id}}&nbsp;&nbsp;</li>
        <li><a :href="`/api/healthCheck/${healthCheck.id}?raw=true`" target="_blank"><small><em>(json)</em></small></a></li>
      </ul>
    </nav> -->
    <v-toolbar>
      <v-btn icon to="/healthCheck"><v-icon size="small">mdi-chevron-left</v-icon></v-btn>
      <v-toolbar-title>{{ healthCheck?.id }} ({{ healthCheck?.serviceUrl }})</v-toolbar-title>
    </v-toolbar>

    <table class="table">
      <tr>
        <th>Service</th>
        <td><router-link :to="`/service/${encodeURIComponent(healthCheck.serviceUrl)}`">{{healthCheck.serviceUrl}}</router-link></td>
      </tr>
      <tr>
        <th>Monitor</th>
        <td><router-link :to="`/monitor/${healthCheck.monitorId}`">{{shortStash(healthCheck.monitorId)}}</router-link></td>
      </tr>
    </table>
    <div class="tabs">
      <ul>
        <li class="is-active"><a>JSON</a></li>
      </ul>
    </div>

    <pre>
{{healthCheckAsJSON()}}
    </pre>

  </v-container>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'

export default defineComponent({
  name: 'ServiceC',
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('healthCheck', ['healthCheck'])
  },
  setup () {
    const store = useStore()
    return { store }
  },
  methods: {
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    shortStash,
    moment: moment,
    healthCheckAsJSON () {
      return JSON.stringify(this.healthCheck, null, 4)
    }
  },
  created () {
    console.debug(this.$route.params)
    this.store.dispatch('healthCheck/setHealthCheck', this.$route.params.id)
  }
})
</script>
