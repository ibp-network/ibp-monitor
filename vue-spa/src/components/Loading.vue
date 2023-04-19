<template>
  <v-dialog v-model="loading">
    <!-- <div class="modal" :class="loading ? 'is-active' : ''"> -->
    <!-- <div class="modal-content"> -->
    <v-card>
      <v-card-text>
        Loading...
        <progress class="progress is-small is-primary" max="100">15%</progress>
      </v-card-text>
    </v-card>
    <!-- </div> -->
    <!-- </div> -->
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LoadingC',
  props: {
    loading: {
      type: Boolean,
    },
  },
})
</script>
