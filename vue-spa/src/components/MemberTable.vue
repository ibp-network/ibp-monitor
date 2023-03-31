<template>

<table class="table is-fullwidth">
  <thead>
    <th v-if="columns.includes('memberId')">ID</th>
    <th v-if="columns.includes('name')">Member</th>
    <th v-if="columns.includes('region')" class="has-text-left">Region</th>
    <th v-if="columns.includes('current_level')" class="has-text-left">Level</th>
    <th v-if="columns.includes('level_timestamp')" class="has-text-left">Level Date</th>
    <th v-if="columns.includes('services')" class="has-text-centered">Services</th>
    <th v-if="columns.includes('updatedAt')">Last Seen (UTC)</th>
    <th v-if="columns.includes('createdAt')">Discovered</th>
  </thead>
  <tbody>
    <tr v-for="member in members" v-bind:key="member.memberId">
      <td v-if="columns.includes('memberId')">
        <a @click="gotoMember(member.memberId)">{{member.memberId}}</a>
      </td>
      <td v-if="columns.includes('name')">
        <a @click="gotoMember(member.memberId)">{{member.name}}</a>
        <v-avatar>
          <v-img :src="member.logo"></v-img>
        </v-avatar>
      </td>
      <td v-if="columns.includes('region')" class="has-text-left">{{member.region}}</td>
      <td v-if="columns.includes('current_level')" class="has-text-centered">{{member.current_level}}</td>
      <td v-if="columns.includes('level_timestamp')">{{formatDateTime(member.level_timestamp)}}</td>
      <td v-if="columns.includes('services')" class="has-text-centered">{{member.services?.length || 0}}</td>
      <td v-if="columns.includes('updatedAt')">{{formatDateTime(member.updatedAt)}}</td>
      <td v-if="columns.includes('createdAt')">{{formatDateTime(member.createdAt)}}</td>
    </tr>
  </tbody>
</table>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'

export default defineComponent({
  name: 'MemberTable',
  props: {
    members: {
      type: Array
    },
    columns: {
      type: Array,
      default () { return ['memberId', 'createdAt', 'updatedAt'] }
      // services?
    }
  },
  computed: {
    ...mapState(['dateTimeFormat'])
  },
  methods: {
    shortStash,
    moment,
    formatDateTime (value: any) {
      console.debug('formatDateTime', value, typeof value)
      const isnum = /^\d+$/.test(value)
      return isnum
        ? moment.unix(value).format(this.dateTimeFormat)
        : moment.utc(value).format(this.dateTimeFormat)
    },
    async gotoMember (memberId: string) {
      await this.$store.dispatch('member/setModel', memberId)
      this.$router.push(`/member/${memberId}`)
    }
  },
  created () {
    console.debug('MemberTable', 'created')
  }
})
</script>
