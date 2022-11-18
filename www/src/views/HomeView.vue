<template>
  <v-container>
    <v-banner class="text-middle">
      <div class="d-flex flex-column justify-space-between align-center">
        <v-img width="70%" src="/dotsama-2.png"></v-img>
      </div>
      <div class="text-h4">Infrastructure Builders Program</div>
    </v-banner>
    <Announcements></Announcements>
    <v-container>
      <v-card>
        <v-card-title>Mission</v-card-title>
        <v-card-text>
          <p class="text-subtitle-1">... to extend the mission of The Thousand Validators program to include providing core
            infrastructure services in a decentralized, autonomous, fault-tolerant, and self-sustaining manner.</p>
          <p class="text-subtitle-1">Operators in the program will lease rack space at unique facilities and deploy owned hardware to
            provide common endpoint and functionality for a variety of core infrastructure services (RPC, Snapshots, Boot nodes,
            Validators, Telemetry).</p>
          <p class="text-subtitle-2">Please join the Treasury Proposal discussion (
            <a href="https://kusama.polkassembly.io/post/1969" target="_blank">link</a> )</p>
          <p class="text-subtitle-2">If you're new to the Polkadot / Kusama ecosystem and want to run a validator,
            start <a href="https://wiki.polkadot.network/docs/maintain-guides-how-to-validate-polkadot">here</a>.</p>
          <p class="text-subtitle-2">If you want to join the 1000 Validators (1KV) Program,
            start <a href="https://thousand-validators.kusama.network/#/getting-started" target="_blank">here</a>.</p>
        </v-card-text>
      </v-card>
    </v-container>
    <!-- <Timeline></Timeline> -->
    <Rules></Rules>
    <!-- <Members></Members> -->
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src
import Rules from '../components/Rules.vue'
import Announcements from '../components/Announcements.vue'

@Component({
  components: {
    Rules,
    Announcements
    // HelloWorld
  }
})
export default class HomeView extends Vue {}
</script>
