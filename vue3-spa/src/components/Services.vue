<template>
  <v-container fluid class="pa-0 ma-0">
    <!-- <v-breadcrumbs>
      <v-breadcrumbs-item to="/">Home</v-breadcrumbs-item>
      <v-breadcrumbs-divider></v-breadcrumbs-divider>
      <v-breadcrumbs-item><b>Services</b></v-breadcrumbs-item>
    </v-breadcrumbs> -->

    <v-toolbar>
      <v-btn icon><v-icon size="small">mdi-server</v-icon></v-btn>
      <v-toolbar-title>Services</v-toolbar-title>
    </v-toolbar>

    <ServiceTable
      v-if="$vuetify.display.width > 599"
      :services="list"
      :columns="['logo', 'endpoint', 'pjs', 'name', 'status']"
    ></ServiceTable>
    <ServiceList v-if="$vuetify.display.width < 600" :services="list"></ServiceList>
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
