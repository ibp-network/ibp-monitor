<template>
  <div class="columns">
  <div class="column is-8-desktop is-offset-2-desktop">
  <table class="table is-fullwidth table-container is-hoverable">
    <thead>
      <th v-if="columns.includes('logo')"></th>
      <th v-if="columns.includes('memberId')">ID</th>
      <th v-if="columns.includes('name')"><v-icon size="small">mdi-account</v-icon>Member</th>
      <th v-if="columns.includes('region')"><v-icon size="small">mdi-map</v-icon> Region</th>
      <th v-if="columns.includes('services')" class="text-centered">
        <v-icon size="small">mdi-server</v-icon>Services
      </th>
      <th v-if="columns.includes('membership')">Membership</th>
      <th v-if="columns.includes('current_level')">
        <v-icon size="small">mdi-seal-variant</v-icon>Level
      </th>
      <th v-if="columns.includes('level_timestamp')" class="text-center">Level Date</th>
      <th v-if="columns.includes('updatedAt')">Last Seen (UTC)</th>
      <th v-if="columns.includes('createdAt')">Discovered</th>
    </thead>

    <tbody>
      <tr
        v-for="member in list"
        v-bind:key="member.id"
        style="cursor: pointer;"
        @click="gotoMember(member.id)"
      >
        <!-- Logo -->
        <td v-if="columns.includes('logo')">
          <!-- <a @click="gotoMember(member.memberId)"> -->
          <v-avatar size="x-small">
            <v-img :src="member.logoUrl"></v-img>
          </v-avatar>
          <!-- </a> -->
        </td>
        <!-- memberID -->
        <td v-if="columns.includes('memberId')">
          <!-- <a @click="gotoMember(member.memberId)"> -->
          {{ member.id }}
          <!-- </a> -->
        </td>
        <!-- Name -->
        <td v-if="columns.includes('name')" style="cursor: pointer">
          <!-- <a @click="gotoMember(member.memberId)"> -->
          {{ member.name }}
          <!-- </a> -->
        </td>
        <!-- Region -->
        <td v-if="columns.includes('region')">{{ regions[member.region]?.name }}</td>
        <td v-if="columns.includes('services')" class="text-center">
          {{ member.services?.length || 0 }}
        </td>
        <td v-if="columns.includes('membership')">{{ member.membershipType }}</td>
        <td v-if="columns.includes('current_level')" class="text-center">
          {{ member.membershipLevelId }}
        </td>
        <td v-if="columns.includes('level_timestamp')" class="text-center">
          {{ formatDateTime(member.membershipLevelTimestamp) }}
        </td>
        <td v-if="columns.includes('updatedAt')">{{ formatDateTime(member.updatedAt) }}</td>
        <td v-if="columns.includes('createdAt')">{{ formatDateTime(member.createdAt) }}</td>
      </tr>

      <!-- for testing only, remove when done 
        <tr 
        v-for="n in 30"
        v-bind:key="n"
        style="cursor: pointer"
       
        >
 
        <td>
            <v-avatar size="x-small">
              <v-img src="."></v-img>
            </v-avatar>
          </td>
 
          <td style="cursor: pointer">
            Stake Plus
          </td>
        
          <td>North America</td>

          <td>Pro</td>
          <td>
            7
          </td>
          
          <td class="text-center">
            2022/03/21
          </td>

        </tr>
      for testing only, remove when done -->


    </tbody>
  </table>
</div>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapState, useStore } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'
import { IMember } from './types'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'MemberTable',
  props: {
    list: {
      type: Object as PropType<[IMember]>,
    },
    columns: {
      type: Array,
      default() {
        return ['memberId', 'createdAt', 'updatedAt']
      },
      // services?
    },
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    return { store, router }
  },
  computed: {
    ...mapState(['regions']),
    // ...mapState('member', ['list'])
  },
  data() {
    return {
      dateTimeFormat: 'YYYY/MM/DD',
    }
  },
  methods: {
    shortStash,
    moment,
    formatDateTime(value: any) {
      console.debug('formatDateTime', value, typeof value)
      const isnum = /^\d+$/.test(value)
      return isnum
        ? moment.unix(value).format(this.dateTimeFormat)
        : moment.utc(value).format(this.dateTimeFormat)
    },
    async gotoMember(memberId: string) {
      await this.store.dispatch('member/setModel', memberId)
      this.router.push(`/member/${memberId}`)
    },
  },
  created() {
    console.debug('MemberTable', 'created')
  },

})
</script>
