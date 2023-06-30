<template>
  <v-container fluid class="pa-0 ma-0">
    <v-toolbar>
      <v-btn icon><v-icon size="small">mdi-pulse</v-icon></v-btn>
      <v-toolbar-title>Checks</v-toolbar-title>
      <v-toolbar-items>
      </v-toolbar-items>
    </v-toolbar>

    <v-row>
      <v-col>
        <v-select density="compact" v-model="statusSel" label="Status" :items="statusIds" multiple></v-select>
      </v-col>
      <v-col>
        <v-select density="compact" v-model="serviceIdsel" label="Service" :items="serviceIds" multiple></v-select>
      </v-col>
      <v-col>
        <v-select density="compact" v-model="memberIdsel" label="Member" :items="memberIds" multiple></v-select>
      </v-col>
      <v-col>
        <v-select density="compact" v-model="source" label="Source" :items="['', 'gossip', 'check']"></v-select>
      </v-col>
    </v-row>

    <CheckTable
      v-if="$vuetify.display.width > 599"
      :healthChecks="list"
      :loading="loading"
      :columns="[
        'id',
        'monitorId',
        'serviceId',
        'memberId',
        'source',
        'version',
        'performance',
        'createdAt',
      ]"
    ></CheckTable>
    <CheckList v-if="$vuetify.display.width < 600" :healthChecks="list"></CheckList>

    <nav class="pagination is-centered" role="navigation" aria-label="pagination">
      <a class="pagination-previous" @click="selectPage(pagination.prev.query)"
        ><i class="fa-solid fa-angle-left"></i
      ></a>
      <a class="pagination-next" @click="selectPage(pagination.next.query)"
        ><i class="fa-solid fa-angle-right"></i
      ></a>
      <ul class="pagination-list">
        <li v-for="(page, idx) in pagination.pages" v-bind:key="idx">
          <a
            :class="`${page.class} ${page.current ? ' is-current' : ''}`"
            @click="selectPage(page.query)"
          >
            {{ page.text }}
          </a>
        </li>
        <button class="button is-white">Items:</button>
        <div class="select">
          <select id="itemsPerPage" label="Items per page" v-model="itemsPerPage">
            <option
              v-for="option in [10, 15, 20, 25, 50]"
              v-bind:key="option"
              :value="option"
              :selected="option === limit"
            >
              {{ option }}
            </option>
          </select>
        </div>
      </ul>
    </nav>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, useStore } from 'vuex'
import CheckTable from './CheckTable.vue'
import CheckList from './CheckList.vue'

export default defineComponent({
  name: 'ChecksC',
  components: {
    CheckTable,
    CheckList,
  },
  setup() {
    const store = useStore()
    return { store }
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('healthCheck', ['list', 'loading', 'pagination', 'where']),
    ...mapState('service', { services: 'list' }),
    ...mapState('member', { members: 'list' }),
    serviceIds() {
      return this.services.map((s: any) => s.id)
    },
    memberIds() {
      return this.members.map((s: any) => s.id)
    },
  },
  data() {
    return {
      statusIds: ['success', 'warning', 'error'],
      statusSel: [],
      memberIdsel: [],
      serviceIdsel: [],
      source: '',
      currentPage: 1,
      itemsPerPage: 10,
      offset: 0,
      limit: 15,
    }
  },
  watch: {
    statusSel(newVal: string) {
      const params = { offset: this.offset, limit: this.limit, where: { status: newVal, memberId: this.memberIdsel, serviceId: this.serviceIdsel, source: this.source } }
      this.store.dispatch('healthCheck/getList', params)
    },
    memberIdsel(newVal: string) {
      const params = { offset: this.offset, limit: this.limit, where: { status: this.statusSel, memberId: newVal, serviceId: this.serviceIdsel, source: this.source } }
      this.store.dispatch('healthCheck/getList', params)
    },
    serviceIdsel(newVal: string) {
      const params = { offset: this.offset, limit: this.limit, where: { status: this.statusSel, memberId: this.memberIdsel, serviceId: newVal, source: this.source } }
      this.store.dispatch('healthCheck/getList', params)
    },
    source(newVal: string) {
      const params = { offset: this.offset, limit: this.limit, where: { status: this.statusSel, memberId: this.memberIdsel, serviceId: this.serviceIdsel, source: newVal } }
      this.store.dispatch('healthCheck/getList', params)
    },
    itemsPerPage(newVal: number) {
      console.debug('watch.itemsPerPage', newVal)
      const params = { offset: 0, limit: newVal, where: { status: this.statusSel, memberId: this.memberIdsel, serviceId: this.serviceIdsel, source: this.source } }
      this.store.dispatch('healthCheck/getList', params)
    },
  },
  methods: {
    // formatDateTime (value: any) {
    //   return moment(value).format(this.dateTimeFormat)
    // },
    parseQuery(queryStr: string) {
      const queryDict = {} as any
      queryStr
        // .search()
        .substr(1)
        .split('&')
        .forEach(function (item) {
          queryDict[item.split('=')[0]] = item.split('=')[1]
        })
      return queryDict
    },
    selectPage(page: string) {
      console.debug('selectPage', page)
      // ?offset=15&limit=15
      const params = this.parseQuery(page)
      console.debug(params)
      // const [offset, limit] = page.replace('?', '')
      this.store.dispatch('healthCheck/getList', params)
    },
    // previous () {},
    handleSelect(evt: any) {
      console.debug('handleSelect()', evt)
      //   var x = document.getElementById('itemsPerPage')
      //   console.debug('handleSelect', x.record)
      //   window.location.href = `/healthCheck?offset=0&limit=${x.record}`
    },
  },
  mounted() {
    this.itemsPerPage = this.store.state.healthCheck.limit
    this.memberIdsel = this.store.state.healthCheck.where.memberId
    this.serviceIdsel = this.store.state.healthCheck.where.serviceId
    this.source = this.store.state.healthCheck.where.source
    this.store.dispatch('healthCheck/getList', {})
  },
})
</script>
