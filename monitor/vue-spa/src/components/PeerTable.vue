<template>

  <table class="table is-fullwidth">
    <thead>
      <th v-if="columns.includes('peerId')">Peer</th>
      <th>Last Seen (UTC)</th>
      <th>Discovered</th>
    </thead>
    <tbody>
      <tr v-for="peer in peers" v-bind:key="peer.id">
        <td v-if="columns.includes('peerId')"><a href="#">{{shortStash(peer.peerId)}}</a></td>
        <td>{{formatDateTime(peer.updatedAt)}}</td>
        <td>{{formatDateTime(peer.createdAt)}}</td>
      </tr>
    </tbody>
  </table>

</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'

export default Vue.extend({
  name: 'PeerTable',
  props: {
    columns: {
      type: Array,
      default () { return ['peerId', 'createdAt', 'updatedAt'] }
      // services?
    },
    peers: {
      type: Array
    }
  },
  computed: {
    ...mapState(['dateTimeFormat'])
  },
  methods: {
    shortStash,
    formatDateTime (value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment
  }
})
</script>
