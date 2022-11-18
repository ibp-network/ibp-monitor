<template>
  <v-app-bar app
    color="warning"
    elevation="0">
    <!-- <v-app-bar-nav-icon to="/">
      <v-icon>mdi-home</v-icon>
    </v-app-bar-nav-icon> -->
    <v-toolbar-title class="has-text-white">
      <v-btn text class="text-none" to="/">
        <v-icon>mdi-home</v-icon>&nbsp;
        dotters.network
      </v-btn>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          text
          v-bind="attrs"
          v-on="on"
        >
          Rules
        </v-btn>
      </template>
      <v-list>
        <v-list-item to="/rules/hobbyist">
          <v-list-item-title>Hobbyist</v-list-item-title>
        </v-list-item>
        <v-list-item to="/rules/professional">
          <v-list-item-title>Professional</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn text to="/members">Members</v-btn>

    <!-- <v-spacer></v-spacer> -->
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
