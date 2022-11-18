<template>
  <v-container class="text-left">
    <v-card>
      <v-card-title color="red">Announcements & Updates</v-card-title>
      <v-divider></v-divider>
      <v-timeline dense>
        <!-- <v-timeline-item small>
          <p>IBP formed</p>
        </v-timeline-item> -->
        <v-timeline-item small icon="mdi-exclamation">
          <v-card>
            <!-- <v-card-title>RPC Nodes</v-card-title> -->
            <v-card-text>
              <p>Proof-of-concept RPC nodes are up! Pull requests created to include these in polkadot.js</p>
              <p>
                <ul>
                  <li><a href="https://polkadot.js.org/apps/?rpc=wss://rpc.dotters.network/polkadot#/explorer" target="_blank">
                    wss://rpc.dotters.network/polkadot</a></li>
                  <li><a href="https://polkadot.js.org/apps/?rpc=wss://rpc.dotters.network/kusama#/explorer" target="_blank">
                    wss://rpc.dotters.network/kusama</a></li>
                  <li><a href="https://polkadot.js.org/apps/?rpc=wss://rpc.dotters.network/westend#/explorer" target="_blank">
                    wss://rpc.dotters.network/westend</a></li>
                </ul>
              </p>
            </v-card-text>
          </v-card>
        </v-timeline-item>
        <v-timeline-item icon="mdi-account-voice">
          <v-card>
            <v-card-text>
              Treatury Proposal post opened on polkassembly. Please feel free to join
                <a href="https://kusama.polkassembly.io/post/1969" target="_blank">the discussion</a>.
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card>

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'AnnouncementsX'
})
</script>
