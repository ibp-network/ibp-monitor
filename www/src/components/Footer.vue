<template>
  <v-footer app padless color="red darken-2" dark>
    <v-col cols="2"></v-col>
    <v-col
      class="text-center"
      cols="8"
    >
    <small>
      built with <a class="dark" href="https://vuetifyjs.com" target="_blank">vuetify.js</a>
    </small>
    </v-col>
    <v-col cols="2">
      <small>
        <a class="nodecoration" href="https://github.com/dotsama-ibp/dotsama-ibp/tree/main/www" target="_blank"><v-icon small>mdi-github</v-icon> github</a>
      </small>
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
.nodecoration {
  color: inherit;
  text-decoration: none;
}
</style>
