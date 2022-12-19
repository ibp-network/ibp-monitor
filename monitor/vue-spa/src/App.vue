<template>
  <div>
    <br>
    <!-- <div class="nav-right nav-menu is-active">this is a sidebar</div> -->
    <NavBar></NavBar>
      <transition name="fade" mode="out-in">
        <router-view/>
      </transition>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

export default Vue.extend({
  components: {
    NavBar,
    Footer
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
