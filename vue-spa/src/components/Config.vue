<template>
  <section class="section">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li class="is-active">&nbsp;&nbsp;Config</li>
      </ul>
    </nav>
    <pre>{{ config }}</pre>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'

export default defineComponent({
  name: 'ServiceC',
  components: {},
  computed: {
    ...mapState(['config']),
  },
  created() {
    console.debug('Config.vue created')
  },
})
</script>
