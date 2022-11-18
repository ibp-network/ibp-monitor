<template>
  <v-card class="text-left">
    <v-card-title>Professional Member</v-card-title>
    <v-card-text>
      <div v-html="md2html"></div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { marked } from 'marked'

/* eslint import/no-webpack-loader-syntax: off */
import mdContent from 'raw-loader!../assets/MembershipPro.md' // vue.config.js: raw-loader

export default Vue.extend({
  name: 'MembershipProf',
  computed: {
    md2html () { return marked(mdContent) }
  }
})
</script>
