<template>
  <v-container fluid class="ma-0 pa-0">

    <!-- <v-breadcrumbs>
      <v-breadcrumbs-item to="/">Home</v-breadcrumbs-item>
      <v-breadcrumbs-divider></v-breadcrumbs-divider>
      <v-breadcrumbs-item to="/member"><b>Monitors</b></v-breadcrumbs-item>
    </v-breadcrumbs> -->
    <v-toolbar>
      <v-btn icon><v-icon size="small">mdi-monitor-eye</v-icon></v-btn>
      <v-toolbar-title>Monitors</v-toolbar-title>
    </v-toolbar>

    <MonitorTable :monitors="list" :columns="['monitorId', 'services', 'createdAt']"></MonitorTable>

  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import MonitorTable from './MonitorTable.vue'

export default defineComponent({
  name: 'MonitorsC',
  components: {
    MonitorTable
  },
  setup () {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState('monitor', ['list'])
  },
  created () {
    this.store.dispatch('monitor/getList')
  }
})
</script>
