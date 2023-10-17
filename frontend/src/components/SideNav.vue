<template>
  <v-navigation-drawer app location="right" v-model="visible">
    <v-toolbar color="rgb(54,54,54)">
      <v-app-bar-title>
        <v-btn color="white" to="/" style="min-height: 25px">
          <v-img src="/image/IBP2.png" width="28" height="28"></v-img>
          &nbsp;Menu
        </v-btn>
      </v-app-bar-title>
      <v-btn icon @click="visible = false">
        <v-icon color="white">mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list>
      <v-list-item to="/member">
        <template v-slot:prepend>
          <v-icon>mdi-account-multiple</v-icon>
        </template>
        Members
      </v-list-item>
      <v-list-item to="/service">
        <template v-slot:prepend>
          <v-icon>mdi-server</v-icon>
        </template>
        Services</v-list-item
      >
      <v-list-item to="/monitor">
        <template v-slot:prepend>
          <v-icon>mdi-monitor-eye</v-icon>
        </template>
        Monitors
      </v-list-item>
      <v-list-item>
        <template v-slot:prepend>
          <v-icon>mdi-pulse</v-icon>
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
      </v-list-item>
      <v-list-item to="/status">
        <template v-slot:prepend>
          <v-icon>mdi-radar</v-icon>
        </template>
        Status</v-list-item
      >
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  setup() {
    const store = useStore()
    const showSideBar = computed(() => store.state.showSideBar)
    const visible = ref(false)
    watch(
      () => showSideBar.value,
      (newVal) => {
        visible.value = newVal
      }
    )
    watch(
      () => visible.value,
      (newVal) => {
        store.dispatch('setSideBar', newVal)
      }
    )
    return {
      visible,
    }
  },
})
</script>
