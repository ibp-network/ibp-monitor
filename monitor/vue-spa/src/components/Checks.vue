<template>
  <section class="section">
    <nav class="level">
      <div class="level-left">
        <nav class="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a href="/">Home</a></li>
            <li class="is-active"><a href="#" aria-current="page">Checks</a></li>
          </ul>
        </nav>
      </div>
    </nav>
    <CheckTable :healthChecks="list" :columns="['id', 'serviceUrl', 'monitorId', 'source', 'version', 'performance', 'updatedAt']"></CheckTable>
    <nav class="pagination is-centered" role="navigation" aria-label="pagination">
      <a class="pagination-previous" @click="selectPage(pagination.prev.query)"><i class="fa-solid fa-angle-left"></i></a>
      <a class="pagination-next" @click="selectPage(pagination.next.query)"><i class="fa-solid fa-angle-right"></i></a>
      <ul class="pagination-list">
        <li v-for="(page, idx) in pagination.pages" v-bind:key="idx">
          <a :class="`${page.class} ${page.current ? ' is-current' : '' }`" @click="selectPage(page.query)">
            {{page.text}}</a>
        </li>
        <button class="button is-white">Items:</button>
        <div class="select">
          <select id="itemsPerPage" label="Items per page" v-model="itemsPerPage">
                <option v-for="option in [10, 15, 20, 25, 50]" v-bind:key="option" :value="option" :selected="option === limit">
                  {{option}}
                </option>
          </select>
        </div>
      </ul>
    </nav>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import CheckTable from './CheckTable.vue'

export default Vue.extend({
  name: 'ServicesC',
  components: {
    CheckTable
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('healthCheck', ['list', 'pagination'])
  },
  data () {
    return {
      itemsPerPage: 10,
      limit: 10
    }
  },
  watch: {
    itemsPerPage (newVal: number) {
      console.debug('watch.itemsPerPage', newVal)
      const params = { offset: 0, limit: newVal }
      this.$store.dispatch('healthCheck/getList', params)
    }
  },
  methods: {
    // formatDateTime (value: any) {
    //   return moment(value).format(this.dateTimeFormat)
    // },
    parseQuery (queryStr: string) {
      var queryDict = {} as any
      queryStr
        // .search()
        .substr(1)
        .split('&')
        .forEach(function (item) { queryDict[item.split('=')[0]] = item.split('=')[1] })
      return queryDict
    },
    selectPage (page: string) {
      console.debug('selectPage', page)
      // ?offset=15&limit=15
      const params = this.parseQuery(page)
      console.debug(params)
      // const [offset, limit] = page.replace('?', '')
      this.$store.dispatch('healthCheck/getList', params)
    },
    // previous () {},
    handleSelect (evt: any) {
      console.debug('handleSelect()', evt)
    //   var x = document.getElementById('itemsPerPage')
    //   console.debug('handleSelect', x.value)
    //   window.location.href = `/healthCheck?offset=0&limit=${x.value}`
    }
  },
  mounted () {
    this.itemsPerPage = this.$store.state.healthCheck.limit
    this.$store.dispatch('healthCheck/getList', {})
  }
})
</script>
