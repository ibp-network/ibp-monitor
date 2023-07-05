<template>
  <v-container class="pa-1">
    <v-toolbar density="compact" class="mb-0 rounded-pill">
      <v-btn icon><v-icon size="small">mdi-server</v-icon></v-btn>
      <v-toolbar-title>Services</v-toolbar-title>
    </v-toolbar>

    <v-container>
      <ServiceTable
        v-if="$vuetify.display.width > 599"
        :services="list"
        :columns="['logo', 'name', 'endpoint', 'status', 'pjs']"
      ></ServiceTable>
      <ServiceList v-if="$vuetify.display.width < 600" :services="list"></ServiceList>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import ServiceTable from './ServiceTable.vue'
import ServiceList from './ServiceList.vue'

export default defineComponent({
  name: 'ServicesC',
  components: {
    ServiceTable,
    ServiceList,
  },
  setup() {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', ['list']),
  },
  data() {
    return {}
  },
  methods: {
    formatDateTime(value: any): string {
      return moment(value).format(this.dateTimeFormat)
    },
  },
  mounted() {
    this.store.dispatch('service/getList')
  },
})
</script>
