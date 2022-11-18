<template>
  <v-app-bar app
    color="red darken2"
    elevation="0">
    <v-app-bar-nav-icon></v-app-bar-nav-icon>
    <v-toolbar-title class="has-text-white">dotters.network</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'AppBar'
})
</script>

<style scoped>
.has-text-white {
  color: white;
}
</style>
