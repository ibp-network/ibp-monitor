<template>
  <v-container class="pa-1">
    <v-toolbar density="compact" class="mb-0 rounded-pill">
      <v-btn icon><v-icon size="small">mdi-account-multiple</v-icon></v-btn>
      <v-toolbar-title>Members</v-toolbar-title>
    </v-toolbar>

    <v-container>
      <MemberList v-if="showList" :list="list" class="d-inline s-sm-none"></MemberList>
      <MemberTable
        v-if="!showList"
        :list="list"
        :columns="['logo', 'name', 'region', 'membership', 'current_level', 'level_timestamp']"
      ></MemberTable>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import MemberTable from './MemberTable.vue'
import MemberList from './MemberList.vue'

export default defineComponent({
  name: 'MembersC',
  components: {
    MemberTable,
    MemberList,
  },
  setup() {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState('member', ['list']),
    showList() {
      // console.debug('width', this.$vuetify.display.width)
      return this.$vuetify.display.width < 600
    },
  },
  created() {
    this.store.dispatch('member/getList')
  },
})
</script>
