<template>
  <v-table class="bg-background is-fullwidth">
    <thead>
      <th v-if="columns.includes('peerId')"></th>
      <th v-if="columns.includes('serviceId')">Service</th>
      <th v-if="columns.includes('memberId')">Member</th>
      <th v-if="columns.includes('updatedAt')">Updated</th>
      <th v-if="columns.includes('createdAt')">Discovered</th>
    </thead>
    <tbody>
      <tr v-for="node in nodes" v-bind:key="node.peerId">
        <td v-if="columns.includes('peerId')" style="cursor: pointer">
          {{ shortStash(node.peerId) }}
        </td>
        <td v-if="columns.includes('serviceId')">
          <router-link :to="`/service/${node.serviceId}`">{{ node.serviceId }}</router-link>
        </td>
        <td v-if="columns.includes('memberId')">
          <router-link :to="`/member/${node.memberId}`">{{ node.memberId }}</router-link>
        </td>
        <td v-if="columns.includes('updatedAt')">{{ formatDateTime(node.updatedAt) }}</td>
        <td v-if="columns.includes('createdAt')">{{ formatDateTime(node.createdAt) }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import { IMemberServiceNode } from './types'
import { shortStash } from './utils'

export default defineComponent({
  name: 'NodeTable',
  props: {
    nodes: {
      // type: Array
      type: Object as PropType<IMemberServiceNode[]>,
    },
    columns: {
      type: Array,
      default() {
        return ['peerId', 'serviceId', 'memberId', 'updatedAt', 'createdAt']
      },
    },
  },
  setup(props) {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
  },
  methods: {
    shortStash: shortStash,
    formatDateTime(value: any): string {
      return moment(value).format(this.dateTimeFormat)
    },
  },
  created() {
    console.debug('NodeTable.vue created', this.nodes)
  },
})
</script>
