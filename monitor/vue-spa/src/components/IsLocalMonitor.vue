<template>
  <small v-if="localMonitorId === monitorId"><i class="fa-regular fa-circle-check"></i></small>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  name: 'IsLocalMonitor',
  computed: {
    ...mapState(['localMonitorId'])
  },
  props: {
    monitorId: {
      type: String
    }
  }
  // mounted () {
  //   console.debug('IsLocalMonitor', this.localMonitorId === this.monitorId, this.localMonitorId, this.monitorId)
  // }
})
</script>
