<template>
  <!-- <v-container fluid class="bg-background d-flex flex-column grow ma-2 pa-2"
    style="cursor: pointer; height: 100%;"> -->

    <v-card class="bg-background card grow" elevation="0" style="height: 100%;" @click="router.push(link)">
      <!-- <v-card-title class="ibp-white">{{title}}</v-card-title> -->

      <v-btn
        style="width: 100%; height: 100%;"
        @click="router.push(link)"
        class="bg-background text-none"
        stacked>
        <span class="text-h6">
          {{ title }}
        </span>
        <span class="text-h5"><v-icon>{{ icon }}</v-icon>
        <br>
        {{ data }}</span>
      </v-btn>

    </v-card>
  <!-- </v-container> -->
</template>

<script lang="ts">
import { useRouter } from 'vue-router'
// import '../assets/style.css'

export default{
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    data: {
      type: Number,
      required: true,
    },
    link: {
      type: String,
      required: true,
    }
  },
  setup() {
    const router = useRouter()
    return { router }
  },
}
</script>

<style scoped>
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