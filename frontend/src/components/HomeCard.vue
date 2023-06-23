<template>
<div class="column is-half" style="cursor: pointer">
        
    <div class="card ">
      <div class="card-header ibp-grey">

        <div class="card-content is-full columns is-vcentered" style="width: 100%;" >        
          <div class="column is-half">
            <p class="ibp-white">{{title}}</p>
          </div>
          <div class="column has-text-right is-half ibp-white">
            <v-icon v-if="title == 'Monitors'">mdi-monitor-eye</v-icon>
            <v-icon v-else-if="title == 'Services'">mdi-server</v-icon>
            <v-icon v-else-if="title == 'Members'">mdi-account-multiple</v-icon>
            <v-icon v-else>mdi-pulse</v-icon>

          </div>
        </div>
      </div>

      <div class="card-content ibp-grey">
        <div class="media">
          <div class="media-content">
            <p class="title is-1 ibp-white">{{ data }}</p>
          </div>
        </div>
      </div>

      <div class="card-header ibp-grey">
        <div class="column card-content">
          <div class="column">
            <div class="button ibp-grey" @click="router.push(link)">
              See More
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script lang="ts">
    import { useRouter } from 'vue-router'

    export default{
        props: {
            title: {
                type: String,
                required: true,
            },
            data: {
                type: String,
                required: true,
            },
            link: {
                type: String,
                required: true,
            }
        },
        setup() {
            const router = useRouter()
            return { router }
        },
    }
</script>