<template>
  <v-app>
    <SideNav></SideNav>
    <NavBar></NavBar>
    <div class="content-wrapper">
      <v-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in" :duration="150">
            <component :is="Component" />
          </transition>
        </router-view>
        <!-- <HelloWorld /> -->
      </v-main>
      <Footer></Footer>
    </div>
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

<style scoped>
.content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

Footer {
  max-height: 120px;
  margin-top: auto;
}
</style>
