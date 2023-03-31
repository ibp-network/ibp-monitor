<template>

  <v-list lines="three">
    <v-list-item v-for="member in members" v-bind:key="member.memberId"
      style="cursor: pointer;"
      @click="gotoMember(member.memberId)">

      <!-- Logo -->
      <template v-slot:prepend>
        <v-avatar>
          <v-img v-show="member.logo !== ''" :src="member.logo"></v-img>
          <!-- <v-icon v-show="member.logo === ''" size="large" color="grey">mdi-circle-outline</v-icon> -->
          <span v-show="member.logo === ''" size="x-large" color="grey">{{ member.name[0]}}</span>
        </v-avatar>
      </template>

      <!-- memberID -->
      <v-list-item-title>
        {{member.name}} ({{member.memberId}})
      </v-list-item-title>

      <v-list-item-subtitle>
        {{member.region}} / {{member.membership}} 
      </v-list-item-subtitle>
      <!-- Region -->
      <td v-if="columns.includes('level_timestamp')" class="text-center">{{formatDateTime(member.level_timestamp)}}</td>
      <td v-if="columns.includes('updatedAt')">{{formatDateTime(member.updatedAt)}}</td>
      <td v-if="columns.includes('createdAt')">{{formatDateTime(member.createdAt)}}</td>

      <template v-slot:append>
        <v-container class="ma-0 pa-0 fill-height custom">
        <!-- <v-row class="align-center fill-height" height="200px"> -->
          <!-- <v-col align="center"> -->
            <!-- <v-btn variant="text" elevation="0" stacked> -->
              <v-badge :content="member.current_level" :color="member.current_level > 0 ? 'green-lighten-4' : 'grey-lighten-2'">
                <v-icon size="large">mdi-seal-variant</v-icon>
              </v-badge>
              &nbsp;&nbsp;&nbsp;
            <!-- </v-btn> -->
          <!-- </v-col> -->
          <!-- <v-col> -->
            <!-- <v-btn elevation="0" class="text-none" stacked> -->
              <v-badge :content="member.services?.length" :color="member.services?.length > 0 ? 'green-lighten-4' : 'grey-lighten-2'">
                <v-icon size="large">mdi-server</v-icon>
              </v-badge>
            <!-- </v-btn> -->
          <!-- </v-col> -->
        <!-- </v-row> -->
        &nbsp;

        </v-container>
      </template>
    </v-list-item>
  </v-list>

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import { shortStash } from './utils'
import { IMember } from './types'

export default defineComponent({
  name: 'MemberTable',
  props: {
    members: {
      // type: Array
      type: Object as PropType<[IMember]>, 
    },
    columns: {
      type: Array,
      default () { return ['memberId', 'createdAt', 'updatedAt'] }
      // services?
    }
  },
  // computed: {
  //   ...mapState(['dateTimeFormat'])
  // },
  setup () {
    const store = useStore()
    return { store }
  },
  data() {
    return {
      dateTimeFormat: 'YYYY/MM/DD'
    }
  },
  methods: {
    shortStash,
    moment,
    formatDateTime (value: any) {
      // console.debug('formatDateTime', value, typeof value)
      const isnum = /^\d+$/.test(value)
      return isnum
        ? moment.unix(value).format(this.dateTimeFormat)
        : moment.utc(value).format(this.dateTimeFormat)
    },
    async gotoMember (memberId: string) {
      await this.store.dispatch('member/setModel', memberId)
      this.$router.push(`/member/${memberId}`)
    }
  },
  created () {
    console.debug('MemberTable', 'created')
  }
})
</script>

<style scoped>
.custom {
  min-height: 63px;
}
</style>