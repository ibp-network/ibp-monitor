<template>
  <v-app :dark="dark">
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
import { defineComponent, onMounted, computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useTheme } from 'vuetify/lib/framework.mjs'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import SideNav from './components/SideNav.vue'

export default defineComponent({
  components: {
    NavBar,
    SideNav,
    // eslint-disable-next-line
    Footer,
  },
  setup() {
    const store = useStore()
    const theme = useTheme()
    const dark = computed(() => store.state.dark)

    store.dispatch('init')
    const matcher = ref()

    const onDark = (evt: any) => {
      console.debug('onDark', evt)
      theme.global.name.value = evt.matches ? 'dark' : 'light'
    }

    watch(() => dark.value, newVal => {
      theme.global.name.value = newVal ? 'dark' : 'light'
    })

    // onMounted(async () => {
    //   console.debug('App.vue: mounted')
    //   matcher.value = window.matchMedia('(prefers-color-scheme: dark)')
    //   // set the initial state from the matcher await this.onDark(this.matcher)
    //   matcher.value.addListener(onDark)
    //   onDark(matcher.value)
    //   // store.dispatch('init')
    // })

    return {
      dark,
      matcher,
      theme
    }

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
