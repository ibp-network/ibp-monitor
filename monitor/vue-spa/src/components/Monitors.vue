<template>
  <section class="section">

  <nav class="level">
    <div class="level-left">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><a href="/">Home</a></li>
          <li class="is-active"><a href="#" aria-current="page">Monitors</a></li>
        </ul>
      </nav>
    </div>
  </nav>
  <!-- <%- include(templateDir + '/monitorsTable.ejs', { monitors, columns: ['monitorId', 'services', 'createdAt'] }); -%>    -->
  <MonitorTable :monitors="list" :columns="['monitorId', 'services', 'createdAt']"></MonitorTable>

  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import MonitorTable from './MonitorTable.vue'

export default Vue.extend({
  name: 'MonitorsC',
  components: {
    MonitorTable
  },
  computed: {
    ...mapState('monitor', ['list'])
  },
  created () {
    this.$store.dispatch('monitor/getList')
  }
})
</script>
