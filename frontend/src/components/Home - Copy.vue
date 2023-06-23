<template>
  <v-container fluid>
    <div class="columns ">
      <div class="column is-one-quarter is-offset-one-quarter-desktop" style="cursor: pointer" @click="router.push('/member')">
        <div class="card has-text-centered">
          <div class="card-header ibp-grey">
            <p class="card-header-title ibp-white">Members</p>
          </div>
          <div class="card-content ibp-grey">
            <div class="media ">
              <div class="media-content">
                <p class="title is-1 ibp-white">{{ memberCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-one-quarter" style="cursor: pointer">
        
        <div class="card ">
          <div class="card-header ibp-grey">

            <div class="card-content is-full columns is-vcentered" style="width: 100%;" >        
              <div class="column is-half">
                <p class="ibp-white">Services</p>
              </div>
            </div>
          </div>

          <div class="card-content ibp-grey">
            <div class="media">
              <div class="media-content">
                <p class="title is-1 ibp-white">{{ serviceCount }}</p>
              </div>
            </div>
          </div>

          <div class="card-header ibp-grey">
            <div class="column card-content">
              <div class="column">
                <a class="button ibp-grey" href="/service">
                  See More
                </a>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-quarter is-offset-one-quarter-desktop" style="cursor: pointer" @click="router.push('/monitor')">
        <div class="card has-text-centered">

          <div class="card-header ibp-grey">
            <p class="card-header-title ibp-white"> </p>
          </div>

          <div class="card-content ibp-grey">
            <div class="media">
              <div class="media-content ">
                <p class="title is-1 ibp-white">{{ monitorCount }}</p>
              </div>
            </div>
          </div>

          <div class="card-header ibp-grey">
            <p class="card-header-title ibp-white">Monitors</p>
          </div>

        </div>
      </div>

      <div class="column is-one-quarter" style="cursor: pointer" @click="router.push('/healthCheck')">
        <div class="card has-text-centered">
          <div class="card-header ibp-grey">
            <p class="card-header-title ibp-white">Checks</p>
          </div>
          <div class="card-content ibp-grey">
            <div class="media">
              <div class="media-content">
                <p class="title is-1 ibp-white">{{ checkCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { mapState } from 'vuex'
import HomeCard from './HomeCard.vue'


export default defineComponent({
  name: 'HomeC',
  setup() {
    const router = useRouter()
    return { router }
  },
  computed: {
    ...mapState(['apiVersion', 'memberCount', 'monitorCount', 'serviceCount', 'checkCount']),
  },
  components: {

  }
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
