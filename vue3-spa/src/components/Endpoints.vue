<template>
  <v-container fluid class="ma-0 pa-0">
    <v-toolbar>
      <v-btn icon><v-icon size="small">mdi-connection</v-icon></v-btn>
      <v-toolbar-title>Endpoints</v-toolbar-title>
    </v-toolbar>

    <v-row>
      <v-col> Services will be migrated over as endpoints </v-col>
    </v-row>

    <!-- <MonitorTable :monitors="list" :columns="['monitorId', 'services', 'createdAt']"></MonitorTable> -->
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import MonitorTable from './MonitorTable.vue'

export default defineComponent({
  name: 'MonitorsC',
  components: {
    MonitorTable,
  },
  setup() {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState('monitor', ['list']),
  },
  created() {
    this.store.dispatch('monitor/getList')
  },
})
</script>
