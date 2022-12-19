<template>
  <footer class="footer">

    <!-- Main container -->
    <nav class="level is-fixed-bottom">
      <!-- Left side -->
      <div class="level-left">
        <p>
          <sup><small><i class="fa-regular fa-circle-check"></i></small></sup> Local MonitorId:
          <router-link :to="`/monitor/${localMonitorId}`">{{ localMonitorId }}</router-link>
        </p>
      </div>

      <!-- Right side -->
      <div class="level-right">
        <p class="level-item">
          <a class="nodecoration" href="https://github.com/dotsama-ibp/dotsama-ibp/tree/main/monitor" target="_blank">
            <!-- <i class="fa-solid fa-code"></i> -->
            <img src="/image/github-logo.png" width="24" height="24">&nbsp;github
          </a>
        </p>
      </div>
    </nav>

  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  name: 'FooterC',
  computed: {
    ...mapState(['localMonitorId'])
  }
})
</script>
