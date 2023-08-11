<template>
  <v-container class="pa-1">
    <v-toolbar density="compact" class="mb-0 rounded-pill">
      <v-btn icon><v-icon size="small">mdi-monitor-eye</v-icon></v-btn>
      <v-toolbar-title>Monitors</v-toolbar-title>
    </v-toolbar>

    <v-container>
      <MonitorTable :monitors="list" :peers="peers" :columns="['id', 'updatedAt', 'createdAt']"></MonitorTable>
    </v-container>
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
    ...mapState('monitor', ['list', 'peers']),
  },
  created() {
    this.store.dispatch('monitor/getList')
  },
})
</script>
