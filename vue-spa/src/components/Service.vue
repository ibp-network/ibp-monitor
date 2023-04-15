<template>
  <section class="section">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/service">Services</router-link></li>
        <li class="is-active">&nbsp;&nbsp;{{ service.serviceUrl }}</li>
      </ul>
    </nav>
    <table class="table is-bordered">
      <tbody>
        <tr>
          <th>Url</th>
          <td>{{ service.serviceUrl }}</td>
        </tr>
        <tr>
          <th>Name</th>
          <td>{{ service.name }}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{ service.status }}</td>
        </tr>
        <tr>
          <th>Member</th>
          <td>
            <router-link :to="`/member/${service.memberId}`">{{ service.memberId }}</router-link>
          </td>
        </tr>
        <tr>
          <th>Error count</th>
          <td>{{ service.errorCount }}</td>
        </tr>
        <tr>
          <th>Polkadot.js</th>
          <td>
            <a :href="`https://polkadot.js.org/apps/?rpc=${service.serviceUrl}`" target="_blank">
              {{ service.serviceUrl }}
              <sup
                ><small><i class="fa-solid fa-arrow-up-right-from-square"></i></small
              ></sup>
            </a>
          </td>
        </tr>
        <tr>
          <th>Discovered</th>
          <td>{{ formatDateTime(service.createdAt) }}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{{ formatDateTime(service.updatedAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="columns">
      <div class="column">
        <div class="tabs">
          <ul>
            <li class="is-active"><a>Monitors</a></li>
          </ul>
        </div>
        <!-- <%- include(templateDir + '/monitorsTable.ejs', { monitors, columns: ['monitorId', 'updatedAt'] }); -%> -->
        <MonitorTable
          :monitors="service.monitors"
          :columns="['monitorId', 'updatedAt']"
        ></MonitorTable>
      </div>
      <div class="column">
        <div class="tabs">
          <ul>
            <li class="is-active"><a>Peers</a></li>
          </ul>
        </div>
        <!-- <%- include(templateDir + '/peersTable.ejs', { peers: service.peers, columns: ['peerId', 'updatedAt'] }); -%> -->
        <PeerTable
          :peers="service.peers"
          :columns="['id', 'serviceUrl', 'status', 'peerId', 'updatedAt']"
        ></PeerTable>
      </div>
    </div>

    <div class="tabs">
      <ul>
        <li class="is-active"><a>Performance</a></li>
        <li>
          <router-link
            :to="`/api/metrics/${encodeURIComponent(service.serviceUrl)}`"
            target="_blank"
          >
            Prometheus &nbsp;<img src="/image/prometheus_logo_orange.svg" alt="" width="18px" />
          </router-link>
        </li>
      </ul>
    </div>
    <!-- <%- include(templateDir + '/checksChart.ejs', { healthChecks }); -%> -->
    <CheckChart :healthChecks="service.healthChecks"></CheckChart>

    <div class="tabs">
      <ul>
        <li class="is-active"><a>Checks</a></li>
      </ul>
    </div>
    <!-- <%- include(templateDir + '/checksTable.ejs', { healthChecks }); -%> -->
    <CheckTable
      :healthChecks="service.healthChecks"
      :columns="['id', 'monitorId', 'source', 'version', 'performance', 'updatedAt']"
    ></CheckTable>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'
import PeerTable from './PeerTable.vue'
import CheckChart from './CheckChart.vue'
import CheckTable from './CheckTable.vue'
import MonitorTable from './MonitorTable.vue'

export default defineComponent({
  name: 'ServiceC',
  components: {
    MonitorTable,
    PeerTable,
    CheckChart,
    CheckTable,
  },
  computed: {
    ...mapState(['dateTimeFormat']),
    ...mapState('service', ['service']),
  },
  methods: {
    formatDateTime(value: any) {
      return moment(value).format(this.dateTimeFormat)
    },
    moment: moment,
  },
  created() {
    console.debug(this.$route.params)
    this.$store.dispatch('service/setService', this.$route.params.serviceUrl)
  },
})
</script>
