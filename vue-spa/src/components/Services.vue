<template>
  <section class="section">
    <nav class="level">
      <div class="level-left">
        <nav class="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li class="is-active">&nbsp;&nbsp;Services</li>
          </ul>
        </nav>
      </div>
    </nav>

    <ServiceTable :services="list" :columns="['serviceUrl', 'pjs', 'name', 'memberLink', 'status', 'monitors']"></ServiceTable>

  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import ServiceTable from './ServiceTable.vue'

// // eslint-disable-next-line
// interface IData {}
// interface IMethods {
//   formatDateTime(value: any): string
// }
// interface IComputed {
//   dateTimeFormat: string
//   list: any[]
// }
// // eslint-disable-next-line
// interface IProps {}

// export default defineComponent<{}, {}, IMethods, IData, IComputed>({
export default defineComponent({
  name: 'ServicesC',
  components: {
    ServiceTable
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', ['list'])
  },
  data () {
    return {}
  },
  methods: {
    formatDateTime (value: any): string {
      return moment(value).format(this.dateTimeFormat)
    }
  },
  mounted () {
    this.$store.dispatch('service/getList')
  }
})
</script>
