<template>

<div class="columns">
  <div class="column is-1 is-narrow-mobile"></div>
  <div class="column">
    <div class="chart-container" style="position: relative; height:40vh;">
      <!-- <canvas id="myChart"></canvas> -->
      <LineChart
        id="myChart"
        :options="chartOptions"
        :data="chartData"
      ></LineChart>
    </div>
  </div>
  <div class="column is-1 is-narrow-mobile"></div>
</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import moment from 'moment'

import { Line as LineChart } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, LineController } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, LineController)

// interface IData {
//   chartOptions: Record<string, any>
//   labels: any[]
//   data: any[]
//   moveMean: number[]
// }
// interface IMethods {
//   makeChartData (): void
// }
// interface IComputed {
//   chartData (): any
// }
// interface IProps {
//   healthChecks: any[]
// }

interface IChartData {
  labels: string[]
  datasets: any[]
}

export default defineComponent({
  name: 'CheckChart',
  components: { LineChart },
  props: {
    healthChecks: {
      type: Array,
      default: () => { return [] }
    }
  },
  computed: {
    chartData (): IChartData {
      return {
        // labels: ['January', 'February', 'March'],
        // datasets: [{ data: [40, 20, 12] }]
        labels: this.labels, // <%-JSON.stringify(labels) %>,
        datasets: [{
          label: 'Service performance (ms)',
          // data: [12, 19, 3, 5, 2, 3],
          data: this.data,
          borderColor: 'darkblue',
          backgroundColor: 'blue',
          borderWidth: 2,
          lineTension: 0.2
        }, {
          label: 'Moving Average',
          data: this.moveMean,
          borderColor: 'darkgreen',
          backgroundColor: 'green',
          borderWidth: 1,
          lineTension: 0.2
        }]
      } as IChartData
    }
  },
  watch: {
    healthChecks () {
      this.makeChartData()
    }
  },
  data () {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      data: [] as any[],
      labels: [] as string[],
      moveMean: [] as number[]
    }
  },
  methods: {
    makeChartData () {
      console.debug('makeChartData()')
      const reversed = [...this.healthChecks].reverse() || []
      this.data = reversed.map((hc: any) => hc.record?.performance || 0)
      console.log('length', this.data.length)
      this.labels = reversed.map((hc: any) => moment.utc(hc.createdAt).format('HH:mm') || '0')
      const period = 3.0
      const moveMean = []
      let mean: number
      for (let i = 0; i < reversed.length; i++) {
        if (i === 0) {
          moveMean.push(this.data[i])
        } else if (i === 1) {
          mean = (this.data[i - 1] + this.data[i - 1] + this.data[i]) / period
          moveMean.push(mean)
        } else {
          mean = (this.data[i - 2] + this.data[i - 1] + this.data[i]) / period
          moveMean.push(mean)
        }
      }
      this.moveMean = moveMean
      // this.chartData = {
      //   // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      //   labels: this.labels, // <%-JSON.stringify(labels) %>,
      //   datasets: [{
      //     label: 'Service performance (ms)',
      //     // data: [12, 19, 3, 5, 2, 3],
      //     data: this.data, // <%- JSON.stringify(data) %>,
      //     borderColor: 'darkblue',
      //     backgroundColor: 'blue',
      //     borderWidth: 2
      //     // lineTension: 0.2,
      //     // options: {
      //     //   elements: {
      //     //     line: {
      //     //       tension : 0.4  // smooth lines
      //     //     },
      //     //   }
      //     // },
      //   }, {
      //     label: 'Moving Average',
      //     data: this.moveMean, // <%- JSON.stringify(moveMean) %>,
      //     borderColor: 'darkgreen',
      //     backgroundColor: 'green',
      //     borderWidth: 1
      //     // lineTension: 0.4,
      //   }]
      // } as any
      console.debug(this.chartData)
    }
  },
  mounted () {
    console.debug('CheckChart.vue: mounted()', this.healthChecks)
    // eslint-disable-next-line
    this.makeChartData()
    // this.healthChecks.reverse() // put it back!
  }
})
</script>
