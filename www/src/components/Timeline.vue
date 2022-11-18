<template>
  <v-container>
    <v-banner>
      Timeline
    </v-banner>

    <v-timeline>

      <v-timeline-item v-for="(item, idx) in items" v-bind:key="idx"
        :color='item.color'
        :icon='item.icon'
        >
        <v-card :color="item.color" dark>
          <v-card-title>{{ item.title }}</v-card-title>
          <v-card-text class="white text--primary">
            {{ item.text }}
          </v-card-text>
        </v-card>
      </v-timeline-item>

      <!-- <v-timeline-item>Proposal</v-timeline-item>

      <v-timeline-item class="text-right">
        timeline item
      </v-timeline-item>

      <v-timeline-item>timeline item</v-timeline-item> -->

    </v-timeline>

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'TimelineX',
  data () {
    return {
      items: [
        {
          icon: 'mdi-star',
          color: 'red lighten2',
          title: 'Prototype',
          text: 'we are here'
        },
        {
          color: 'purple darken-1',
          icon: 'mdi-book-variant',
          title: '',
          text: ''
        },
        {
          color: 'green lighten-1',
          icon: 'mdi-airballoon',
          title: '',
          text: ''
        },
        {
          color: 'indigo',
          icon: 'mdi-exclamation',
          title: '',
          text: ''
        }
      ]
    }
  }
})
</script>
