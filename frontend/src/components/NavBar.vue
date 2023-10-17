<template>
  <v-app-bar color="rgb(54,54,54)">
    <v-app-bar-title>
      <v-btn color="white" to="/" style="min-height: 25px">
        <v-img src="/image/IBP2.png" width="28" height="28"></v-img>
        &nbsp;IBP Dashboard
      </v-btn>
    </v-app-bar-title>

    <!-- <v-spacer></v-spacer> -->
    <v-toolbar-items class="d-none d-sm-flex">
      <v-btn color="white" variant="plain" to="/member">
        <template v-slot:prepend>
          <v-icon v-if="$vuetify.display.width > 900">mdi-account-multiple</v-icon>
        </template>
        Members
      </v-btn>
      <v-btn color="white" variant="plain" to="/service">
        <template v-slot:prepend>
          <v-icon v-if="$vuetify.display.width > 900">mdi-server</v-icon>
        </template>
        Services
      </v-btn>
      <v-btn color="white" variant="plain" to="/monitor">
        <template v-slot:prepend>
          <v-icon v-if="$vuetify.display.width > 900">mdi-monitor-eye</v-icon>
        </template>
        Monitors
      </v-btn>
      <v-btn color="white" variant="plain">
        <template v-slot:prepend>
          <v-icon v-if="$vuetify.display.width > 900">mdi-pulse</v-icon>
        </template>
        Checks

        <v-menu activator="parent" location="bottom">
          <v-list>
            <v-list-item>
              <v-btn to="/healthCheck">
                Members
              </v-btn>
              <v-btn to="/healthCheck/non-members">
                Non-Members
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-btn color="white" variant="plain" to="/status">
        <template v-slot:prepend>
          <v-icon v-if="$vuetify.display.width > 900">mdi-radar</v-icon>
        </template>
        Status
      </v-btn>
    </v-toolbar-items>
    <v-spacer></v-spacer>

    <v-app-bar-nav-icon
      color="white"
      class="d-flex d-sm-none"
      @click="toggleNavBar()"
    ></v-app-bar-nav-icon>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mapState, useStore } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    return { store, route, router }
  },
  computed: {
    ...mapState(['packageVersion', 'apiVersion']),
  },
  data() {
    return {
      isActive: false,
    }
  },
  methods: {
    toggleNavBar() {
      this.isActive = !this.isActive
      this.store.dispatch('toggleSideBar')
    },
    navTo(route: string) {
      this.isActive = false
      // console.debug(this.$route)
      if (this.route.path !== route) {
        this.router.push(route)
      }
    },
  },
})
</script>

<!-- <style scoped>
.menu-btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: all .5s ease-in-out;
  /* border: 3px solid #fff; */
}
.menu-btn__burger {
  width: 24px;
  height: 1px;
  background: #fff;
  border-radius: 1px;
  /* box-shadow: 0 2px 5px rgba(255,101,47,.2); */
  transition: all .3s ease-in-out;
}
.menu-btn__burger::before,
.menu-btn__burger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 1px;
  background: #fff;
  border-radius: 1px;
  /* box-shadow: 0 2px 5px rgba(255,101,47,.2); */
  transition: all .3s ease-in-out;
}
.menu-btn__burger::before {
  transform: translateY(-9px);
}
.menu-btn__burger::after {
  /* transform: rotate(-45px); */
  transform: translateY(9px);
}
/* ANIMATION */
.menu-btn.open .menu-btn__burger {
  transform: translateX(50px);
  background: transparent;
  box-shadow: none;
}
.menu-btn.open .menu-btn__burger::before {
  transform: rotate(45deg) translate(-35px, 35px);
}
.menu-btn.open .menu-btn__burger::after {
  transform: rotate(-45deg) translate(-35px, -35px);
}
</style> -->
