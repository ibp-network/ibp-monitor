<template>
  <v-container>
    <v-card class="mx-auto"
    max-width="400"
    tile>
      <v-card-title>Contacts</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item three-line v-for="contact in contacts" :key="contact.email">
            <v-list-item-avatar><v-gravatar :email="contact.email"></v-gravatar></v-list-item-avatar>
            <!-- <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon> -->
            <v-list-item-content>
              <v-list-item-title>{{ contact.name }}</v-list-item-title>
              <v-list-item-subtitle>{{contact.role}}</v-list-item-subtitle>
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
  name: 'ContactsX',
  data () {
    return {
      contacts: [
        {
          email: '',
          name: 'Tom | Stake.Plus',
          role: 'Proposer',
          twitter: '@_derekc_',
          matrix: '@stakeplus:matrix.org'
        },
        {
          name: 'kukabi | helikon.io',
          matrix: '@helikon:matrix.org',
          role: 'Prototyper'
        },
        {
          email: '',
          name: 'Math Crypto',
          role: 'Supporter',
          matrix: '@mathcrypto:matrix.org'
        },
        {
          email: 'derek@metaspan.com',
          name: 'derek // metaspan',
          role: 'Supporter, Developer',
          twitter: '@_derekc_',
          matrix: '@metaspan:matrix.org'
        }
      ]
    }
  }
})
</script>
