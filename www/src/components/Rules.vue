<template>
  <v-container class="text-left">
    <v-card>
      <v-card-title>Rules of the program</v-card-title>
      <v-card-text>
        <ul>
          <li>You must belong to the
             <a href="https://wiki.polkadot.network/docs/maintain-guides-how-to-validate-polkadot" target="_blank">1000 Validators Program [1KV | TVP]</a>.</li>
          <li>You must deploy your own hardware in an independent datacentre (no AWS, GCP)</li>
        </ul>
        <br>
        <p>There are 2 levels of membership:
          <ul>
            <li><router-link to="/rules/hobbyist">Hobbyist</router-link></li>
            <li><router-link to="/rules/professional">Professional</router-link></li>
          </ul>
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'RulesX'
})
</script>
