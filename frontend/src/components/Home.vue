<template>
  <v-container fluid class="d-flex grow flex-column flex-nowrap ma-0 pa-0"
    style="height: 100%;">

    <v-row class="grow">

      <v-col :cols="cols[0]" class="d-flex flex-column">
        <v-row class="grow">
          <v-col cols="6" class="d-flex flex-column">
            <HomeCard class="ma-0" title="Members"  :data="memberCount"  icon="mdi-account-multiple" link="/member" />
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <HomeCard class="ma-0" title="Services" :data="serviceCount" icon="mdi-server" link="/service" />
          </v-col>
        <!-- </v-row>
        <v-row class="grow"> -->
          <v-col cols="6" class="d-flex flex-column">
            <HomeCard class="ma-0" title="Monitors" :data="monitorCount" icon="mdi-monitor-eye" link="/monitor" />
          </v-col>
          <v-col cols="6" class="d-flex flex-column">
            <HomeCard class="ma-0" title="Checks"   :data="checkCount"   icon="mdi-pulse" link="/healthCheck" />
          </v-col>
        </v-row>
      </v-col>

      <v-col :cols="cols[1]" height="100%">
        <iframe style="height: 100%; width: 100%; border: none;"
          title="IBP Coverage Map"
          src="node-map.html"></iframe>
      </v-col>

    </v-row>

    <!-- <div class="columns">

      <div class="column ">
        <div class="columns">
          <HomeCard title="Members"  :data="memberCount"    link="/member" />
          <HomeCard title="Services" :data="serviceCount"   link="/service" />
        </div>

        <div class="columns">
          <HomeCard title="Monitors" :data="monitorCount"   link="/monitor" />
          <HomeCard title="Checks"   :data="checkCount"     link="/healthCheck" />
        </div>
      </div>

        <div class="column">
          <iframe class="is-full" style="height: 100%; width: 100%;" title="IBP Coverage Map"
            src="node-map.html"></iframe>
          <node-map></node-map>
        </div>
    </div> -->

    <!-- <v-row>
      <v-col :cols="cols[0]" class="d-flex align-stretch mb-6 bg-surface-variant">
        <v-row>
          <v-col>
            <div class="card has-text-centered">              
              <div class="card-header ibp-grey">
                <p class="card-header-title ibp-white">Members</p>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-1">{{ memberCount }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col>
            <div class="card has-text-centered">
              <div class="card-header ibp-grey">
                <p class="card-header-title ibp-white">Services</p>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-1">{{ serviceCount }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="card has-text-centered">
              <div class="card-header has-background-primary">
                <p class="card-header-title">Monitors</p>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-1">{{ monitorCount }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col>
            <div class="card has-text-centered">
              <div class="card-header has-background-primary">
                <p class="card-header-title">Checks</p>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-1">{{ checkCount }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col :cols="cols[1]">
        <node-map></node-map>
      </v-col>
    </v-row> -->

</v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import HomeCard from './HomeCard.vue'
import NodeMap from './NodeMap.vue'
// import VueLeaflet from './VueLeaflet.vue'

// import '../assets/style.css'

export default defineComponent({
  name: 'HomeC',
  components: {
    HomeCard,
    NodeMap,
    // VueLeaflet,
  },
  computed: {
    cols () {
      const { lg, md, sm } = this.$vuetify.display
      return lg ? [4, 8]
                : md ? [5, 7]
                     : sm ? [12, 12]
                          : [12, 12]
    },
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const apiVersion = computed(() => store.state.apiVersion)
    const memberCount = computed(() => store.state.memberCount)
    const monitorCount = computed(() => store.state.monitorCount)
    const serviceCount = computed(() => store.state.serviceCount)
    const checkCount = computed(() => store.state.checkCount)
    return { router, apiVersion, memberCount, monitorCount, serviceCount, checkCount }
  },
})
</script>

<style scoped>
.v-card-title {
  background-color: rgb(0, 209, 178);
}
.v-card-text .text-h3 {
  display: grid;
  align-content: center;
}

:root{
  --dark:  #222222;
  --white: #f4f4f4;
  --grey:  #222222;
  --light-grey: #2e2e2e;
  --lighter-grey: #969696;
  --blue: #00A8FC;
  --green: #0DBD8B;
  --red: #FF4F3E;
  --yellow: #F0B132;
}
.v-toolbar{
  margin-bottom: 5rem;
}

footer > .v-toolbar{
  margin-bottom: 0;
}
.ibp-red{
  color: var(--red);
}
.ibp-green{
  color: var(--green);
}
.ibp-yellow{
  color: var(--yellow);
}
div.ibp-grey, .button.ibp-grey{
  background-color: var(--grey);
}
.button.ibp-grey{
  color: var(--white);
  border-color: var(--light-grey);
  transition: color 0.125s linear, background-color 0.125s linear;
}
.button.ibp-grey:hover{
  background-color: var(--white);
  color: var(--dark);
}
.button{
  font-size: 0.825rem;
}
p.ibp-white{
  color: var(--white);
}
.table.is-hoverable tbody tr:not(.is-selected):hover, .has-background-primary{
  background-color: var(--light-grey);
  transition: background-color 0.125s linear;
}
.table thead th,  th, th > i, td, p{
  color: var(--white);
  /* Have to import Inter Locally */
  font-family: 'Inter';
  font-weight: 500;
  font-size: 0.825rem;
}
.table td, .table th{
  border-color: var(--light-grey);
  padding: 1em 1em;
  margin: 1rem;
}
.table th{
  color: var(--white);
  font-weight: bold;
}
.table thead th{
  border-width: 0 0 1px;
  border-color: var(--light-grey);
  font-weight: bold;
}
.table-container, tr, tbody, table, .table{
  background-color: var(--grey);

}
.table-container > thead > th{
  padding-top: 1rem;
  padding-bottom: 0.5rem;
}

.table-container{
  position: relative;
  border: solid var(--light-grey) 1px;
  border-radius: 0.5rem;
  border-collapse: separate !important;

  box-shadow: 0 2px 2px rgba(0,0,0,0.12), 
            0 4px 4px rgba(0,0,0,0.12), 
            0 8px 8px rgba(0,0,0,0.12), 
            0 16px 16px rgba(0,0,0,0.12),
            0 32px 32px rgba(0,0,0,0.12);
}

.table{
  background-color: var(--grey);
  padding: 1rem 3rem 1rem 3rem;
}

.is-sticky{
  position: -webkit-sticky;
  position: sticky;
}
th {
  position: -webkit-sticky;
  position: sticky;
  top: 60px;
  z-index: 2;
  background-color: var(--grey);
  border-radius: 0.5rem 0.5rem 0rem 0rem;
}

td > div > a, td > a, a.link{
  color: var(--blue);
}
td > div > a:hover, td > a:hover, a.link:hover{
  color: var(--blue);
  text-decoration:underline;
}

td.status{
  text-align: center;
  font-weight: bold;
}

td.online{
  color: var(--green);
}
td.active{
  color: var(--yellow);
}
td.offline{
  color: var(--red);
}
td.planned{
  color: var(--lighter-grey);
}

option{
  background-color: var(--dark);
}

.pagination-link.is-current{
  background-color:var(--light-grey);;
  border-color: var(--light-grey);
  color: var(--white);
}

.pagination-link, .pagination-next, .pagination-previous{
  border-color: var(--lighter-grey);
  color: var(--lighter-grey);
}
.pagination-link:hover, .pagination-next:hover, .pagination-previous:hover{
  background-color: var(--light-grey);
  color: var(--white);
  transition: background-color 0.125s linear;
}

.input, .select select, .textarea{
  background-color: transparent;
  color: var(--white);
  border-color: var(--lighter-grey);

}

ul.pagination-list > .button.is-white{
  background-color: transparent;
  color: var(--white);
}
/* .chart-container{
  background-color: var(--white);
  padding: 1rem;
} */

.service-name > div{
  color: var(--white);
  font-family: 'Inter';
}

.status-inner .status{
  background-color: var(--grey);
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}
.no-data{
  background-color: var(--light-grey);
}

.error{
  background-color: var(--red);
}

.success{
  background-color: var(--green);
}
</style>
