<template>
  <v-footer
    class="mt-5 bg-grey-lighten-4 text-black text-center d-flex flex-column text-body-2">
    <div>&nbsp;</div>
    <v-container class="ma-0 pa-0" style="border-top: 1px grey;">
      <v-row width="100%">
      <v-col class="text-left">
        <ul>
          <li style="whitespace: nowrap">
            <a class="nodecoration" href="https://ibp.network" target="_blank" rel="noopener noreferrer">
              <v-icon size="x-small">mdi-open-in-new</v-icon>
              &nbsp;IBP.network</a>
          </li>
          <li style="whitespace: nowrap">
            <a class="nodecoration" href="https://dotters.network" target="_blank" rel="noopener noreferrer">
              <v-icon size="x-small">mdi-open-in-new</v-icon>
              &nbsp;dotters.network</a>
          </li>
        </ul>
      </v-col>
      <!-- <v-col>
        <ul>
          <li>one</li>
          <li>one</li>
          <li>one</li>
        </ul>
      </v-col> -->
      <v-col class="text-right">
        <ul>
          <li>
            ui: {{ packageVersion }} /
            api: {{ apiVersion }}
            &nbsp;<v-icon size="x-small">mdi-source-branch</v-icon>
          </li>
          <li>
            <a class="nodecoration" href="https://github.com/ibp-network/ibp-monitor" target="_blank" rel="noopener noreferrer">
              github
              &nbsp;<v-icon size="x-small">mdi-github</v-icon> 
            </a>
          </li>
          <li>
            <a class="nodecoration" href="https://wiki.ibp.network/docs" target="_blank" rel="noopener noreferrer">
              docs
              &nbsp;<v-icon size="x-small">mdi-bookshelf</v-icon> 
            </a>
          </li>
        </ul>
      </v-col>
    </v-row>

    </v-container>
    <div>
      <span>
        <sup
          ><small><i class="fa-regular fa-circle-check"></i></small
        ></sup>
        Local MonitorId:
        <router-link :to="`/monitor/${localMonitorId}`">
          <span class="d-none d-sm-inline">{{ localMonitorId }}</span>
          <span class="d-sm-none d-inline">{{ shortStash(localMonitorId) }}</span>
        </router-link>
      </span>
    </div>

  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import { shortStash } from './utils';

export default defineComponent({
  name: 'FooterC',
  computed: {
    ...mapState(['packageVersion', 'apiVersion', 'localMonitorId']),
  },
  methods: {
    shortStash,
  },
})
</script>

<style scoped>
.nodecoration {
  text-decoration: none;
  color: inherit;
}
</style>