<template>
  <v-app>
    <SideNav></SideNav>
    <NavBar></NavBar>
    <v-main>
      <router-view v-slot="{ route, Component }">
        <transition name="fade" mode="out-in" :duration="150">
          <component :key="route.name" :is="Component" />
        </transition>
      </router-view>
      <!-- <HelloWorld /> -->
      <Footer></Footer>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import SideNav from './components/SideNav.vue'
// import HelloWorld from '@/components/HelloWorld.vue'

export default defineComponent({
  components: {
    NavBar,
    SideNav,
    // eslint-disable-next-line
    Footer,
  },
  setup() {
    useStore().dispatch('init')
  },
})
</script>
