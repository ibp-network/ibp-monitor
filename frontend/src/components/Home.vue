<template>
  <v-container fluid>
    <div class="columns">
      <div class="column" style="cursor: pointer" @click="router.push('/member')">
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

      <div class="column" style="cursor: pointer" @click="router.push('/service')">
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

      <div class="column" style="cursor: pointer" @click="router.push('/monitor')">
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

      <div class="column" style="cursor: pointer" @click="router.push('/healthCheck')">
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
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'HomeC',
  setup() {
    const store = useStore()
    const router = useRouter()
    const apiVersion = computed(() => store.state.apiVersion)
    const memberCount = computed(() => store.state.memberCount)
    const monitorCount = computed(() => store.state.monitorCount)
    const serviceCount = computed(() => store.state.serviceCount)
    const checkCount = computed(() => store.state.checkCount)
    return { router, apiVersion, memberCount, monitorCount, serviceCount, checkCount }
  },
})
</script>

<style scoped>
.v-card-title {
  background-color: rgb(0, 209, 178);
}
.v-card-text .text-h3 {
  display: grid;
  align-content: center;
}
</style>
