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
        <v-fade-transition>
          <router-view></router-view>
        </v-fade-transition>
      </v-main>
    </v-container>
    <br>
    <br>
    <Footer></Footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Appbar from './components/Appbar.vue'
import Footer from './components/Footer.vue'

export default Vue.extend({
  components: {
    Appbar,
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
