<template>
  <transition>
    <v-dialog v-model="lloading" width="300" height="300">
      <v-card>
        <v-card-text>
          Loading...
          <progress class="progress is-small is-primary" max="100">15%</progress>
        </v-card-text>
      </v-card>
    </v-dialog>
  </transition>
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
  data() {
    return {
      lloading: false,
    }
  },
  watch: {
    loading: {
      immediate: true,
      handler(val) {
        this.lloading = val
      },
    },
  },
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>