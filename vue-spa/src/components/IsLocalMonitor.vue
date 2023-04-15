<template>
  <small v-if="localMonitorId === monitorId"><i class="fa-regular fa-circle-check"></i></small>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

export default defineComponent({
  name: 'IsLocalMonitor',
  computed: {
    ...mapState(['localMonitorId']),
  },
  props: {
    monitorId: {
      type: String,
    },
  },
  // mounted () {
  //   console.debug('IsLocalMonitor', this.localMonitorId === this.monitorId, this.localMonitorId, this.monitorId)
  // }
})
</script>
