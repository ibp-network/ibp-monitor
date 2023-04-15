<template>
  <section class="section">
    <div class="columns">
      <div class="column" style="cursor: pointer" @click="$router.push('/member')">
        <div class="card has-text-centered">
          <div class="card-header has-background-primary">
            <p class="card-header-title">Members</p>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-1">{{ memberCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column" style="cursor: pointer" @click="$router.push('/service')">
        <div class="card has-text-centered">
          <div class="card-header has-background-primary">
            <p class="card-header-title">Services</p>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-1">{{ serviceCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column" style="cursor: pointer" @click="$router.push('/monitor')">
        <div class="card has-text-centered">
          <div class="card-header has-background-primary">
            <p class="card-header-title">Monitors</p>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-1">{{ monitorCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column" style="cursor: pointer" @click="$router.push('/healthCheck')">
        <div class="card has-text-centered">
          <div class="card-header has-background-primary">
            <p class="card-header-title">Checks</p>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-1">{{ checkCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

export default defineComponent({
  name: 'HomeC',
  computed: {
    ...mapState(['apiVersion', 'memberCount', 'monitorCount', 'serviceCount', 'checkCount']),
  },
  created() {
    this.$store.dispatch('getHome')
  },
})
</script>
