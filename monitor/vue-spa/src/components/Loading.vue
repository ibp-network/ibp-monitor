<template>
  <div class="modal" :class="loading ? 'is-active' : ''">
    <!-- <div class="modal-background"></div> -->
    <div class="modal-content">
      <!-- Any other Bulma elements you want -->
      <div class="card">
        <div class="card-content">
          Loading...
          <progress class="progress is-small is-primary" max="100">15%</progress>
        </div>
      </div>
    </div>
    <!-- <button class="modal-close is-large" aria-label="close"></button> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'LoadingC',
  props: {
    loading: {
      type: Boolean
    }
  }
})
</script>
