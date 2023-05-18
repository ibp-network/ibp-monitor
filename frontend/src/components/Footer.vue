<template>
  <v-footer app color="rgb(54,54,54)">
    <v-toolbar density="compact" color="rgb(54,54,54)">
      <span style="color: white">
        <sup
          ><small><i class="fa-regular fa-circle-check"></i></small
        ></sup>
        Local MonitorId:
        <router-link :to="`/monitor/${localMonitorId}`">{{ localMonitorId }}</router-link>
      </span>

      <v-spacer></v-spacer>

      <v-btn color="white">
        <small>
          <!-- <small> -->
          ui: {{ packageVersion }} <br />
          api: {{ apiVersion }}
          <!-- </small> -->
        </small>
      </v-btn>

      <!-- <v-avatar sizze="x-small"> -->
      <v-btn icon color="white" href="https://github.com/ibp-network/ibp-monitor" target="_blank">
        <!-- <img src="/image/github-logo.png" width="24" height="24">&nbsp;github -->
        <v-icon>mdi-github</v-icon>
      </v-btn>
      <!-- </v-avatar> -->

      <!--
    <div class="d-flex w-100 align-center px-4">
      <v-btn class="text-none" :to="`/monitor/${localMonitorId}`" >
        Local MonitorId:{{ localMonitorId }}
        <template v-slot:append>
          <v-icon>mdi-check-circle-outline"</v-icon>
        </template>
      </v-btn>
      <v-divider></v-divider>
      <a class="nodecoration" href="https://github.com/dotsama-ibp/dotsama-ibp/tree/main/monitor" target="_blank">
        <img src="/image/github-logo.png" width="24" height="24">&nbsp;github
      </a>
    </div>
    -->
    </v-toolbar>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

export default defineComponent({
  name: 'FooterC',
  computed: {
    ...mapState(['packageVersion', 'apiVersion', 'localMonitorId']),
  },
})
</script>
