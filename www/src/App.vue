<template>
  <v-app>
    <!-- <v-navigation-drawer app>
    </v-navigation-drawer> -->
    <Appbar></Appbar>
    <!-- <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav> -->
    <!-- <router-view/> -->
    <v-container>
      <v-main>
        <v-banner>
          <div class="text-h4">Dotsama Infrastructure Builders Program</div>
        </v-banner>
        <v-card>
          <v-card-title>Mission</v-card-title>
          <v-card-text>
            <p class="text-subtitle-1">... to extend the mission of The Thousand Validators program to include providing core infrastructure services in a decentralized, autonomous, fault-tolerant, and self-sustaining manner.</p>
            <p class="text-subtitle-1">Operators in the program will lease rack space at unique facilities and deploy owned hardware to provide common endpoint and functionality for a variety of core infrastructure services (RPC, Snapshots, Boot nodes, Validators, Telemetry).</p>
            <p class="text-subtitle-2">Please join the Treasury Proposal discussion ( <a href="https://kusama.polkassembly.io/post/1969" target="_blank">link</a> )</p>
          </v-card-text>
        </v-card>
        <!-- <Timeline></Timeline> -->
      </v-main>
    </v-container>
    <Contacts></Contacts>
    <br>
    <br>
    <Footer></Footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Appbar from './components/Appbar.vue'
// import Timeline from './components/Timeline.vue'
import Contacts from './components/Contacts.vue'
import Footer from './components/Footer.vue'

export default Vue.extend({
  components: {
    Appbar,
    Contacts,
    // Timeline,
    Footer
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
