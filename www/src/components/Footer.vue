<template>
  <v-footer app padless color="red darken-2" dark>
    <v-col
      class="text-center"
      cols="12"
    >
      built with <a class="dark" href="https://vuetifyjs.com" target="_blank">vuetify.js</a>
    </v-col>
  </v-footer>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'FooterMy'
})
</script>

<style scoped>
.dark {
  color: white !important;
}
</style>
