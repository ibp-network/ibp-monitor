<template>
  <v-container class="text-left">
    <v-card class="mx-auto"
    max-width="500"
    tile>
      <v-card-title>Members</v-card-title>
      <v-card-text>
        <p>The program is currently in 'proof-of-concept' mode. The POC aims to validate the network design and reference hardware.
          </p>
        <p>The results of the proof-of-concept will be used in the Treasury Proposal.
          <i>(Currently being discussed <a href="https://kusama.polkassembly.io/post/1969" target="_blank">here</a>)</i>.</p>
        <v-list>
          <v-list-item three-line v-for="contact in contacts" :key="contact.matrix">
            <v-list-item-avatar>
              <v-img v-if="contact.avatar" :src="contact.avatar"></v-img>
              <v-gravatar v-if="!contact.avatar" :email="contact.email"></v-gravatar></v-list-item-avatar>
            <!-- <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon> -->
            <v-list-item-content>
              <v-list-item-title>{{ contact.name }}</v-list-item-title>
              <v-list-item-subtitle>Level: {{contact.level}}</v-list-item-subtitle>
              <v-list-item-subtitle> <a :href="`https://matrix.to/#/${contact.matrix}`" target="_blank" rel="noopener noreferrer">{{ contact.matrix }}</a></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'MembersX',
  data () {
    return {
      contacts: [
        {
          email: '',
          name: 'Tom | Stake.Plus',
          role: 'Proposer',
          level: 'Professional',
          twitter: '@_derekc_',
          matrix: '@stakeplus:matrix.org',
          avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAF5JREFUWEft0rENwCAQBEG+ACp3Ta7NFLEJsoZ8JTR/s9/nWxe/8cF4HYIRcBEkWAVqb4MEq0DtbZBgFai9DRKsArW3QYJVoPY2SLAK1N4GCVaB2tsgwSpQexv8veAB5KtdSauHFxMAAAAASUVORK5CYII='
        },
        {
          name: 'kukabi | helikon.io',
          matrix: '@helikon:matrix.org',
          role: 'Prototyper',
          level: 'Professional',
          avatar: 'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/YEMtkRggwrAEPTMuHnSUqLYQ?width=566&height=566&method=scale'
        },
        // {
        //   email: '',
        //   name: 'Math Crypto',
        //   role: 'Supporter',
        //   level: 'Prospect (Pro)',
        //   matrix: '@mathcrypto:matrix.org'
        // },
        {
          name: '🍁 High/Stake 🥩',
          matrix: '@highstake:matrix.org',
          avatar: 'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/sJZXqOTAPOohmYVaCcGzxjjR?width=566&height=566&method=scale'
        },
        {
          email: 'derek@metaspan.com',
          name: 'derek // metaspan',
          role: 'Supporter, Developer',
          level: 'Prospect (Pro)',
          twitter: '@_derekc_',
          matrix: '@metaspan:matrix.org',
          avatar: 'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/ookEboDLeYjzRqnUSYaOYGuW?width=566&height=566&method=scale'
        },
        {
          name: 'dev0_sik | crifferent.de',
          level: 'Prospect (Pro)',
          matrix: '@dev0_sik:matrix.org',
          avatar: 'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/FbEIsMPjXvzHwLlETPCtcMmv?width=566&height=566&method=scale'
        },
        {
          name: 'Miloš | GATOTECH',
          level: 'Prospect (Pro)',
          matrix: '@gatotech:matrix.org'
        }
        // {
        //   name: 'paulo // turboflakes.io',
        //   level: 'Prospect (Pro)',
        //   matrix: '@turboflakes:matrix.org',
        //   avatar: 'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/dLggqaYVuiRZlVEaBgAwfwJe?width=566&height=566&method=scale'
        // }
      ]
    }
  }
})
</script>
