<template>
  <section class="section">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/member">Members</router-link></li>
        <li class="is-active">&nbsp;&nbsp;{{ member.name }}</li>
      </ul>
    </nav>
    <table class="table is-bordered">
      <tbody>
        <tr>
          <th>ID</th>
          <td>{{ member.memberId }}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{{ member.name }}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{ member.status }}</td>
        </tr>
        <tr>
          <th>Discovered</th>
          <td>{{ formatDateTime(member.createdAt) }}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{{ formatDateTime(member.updatedAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="columns">
      <div class="column">
        <div class="tabs">
          <ul>
            <li class="is-active"><a>Services</a></li>
          </ul>
        </div>
        <ServiceTable
          :services="member.services"
          :columns="['serviceUrl', 'name', 'pjs', 'updatedAt']"
        ></ServiceTable>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
// import PeerTable from './PeerTable.vue'
// import CheckChart from './CheckChart.vue'
// import CheckTable from './CheckTable.vue'
import ServiceTable from './ServiceTable.vue'

export default defineComponent({
  name: 'MemberC',
  components: {
    ServiceTable,
    //   PeerTable,
    //   CheckChart,
    //   CheckTable
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('member', { member: 'model' }),
  },
  methods: {
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment,
  },
  created() {
    console.debug(this.$route.params)
    if (this.member.memberId !== this.$route.params.memberId) {
      this.$store.dispatch('member/setModel', this.$route.params.memberId)
    }
  },
})
</script>
