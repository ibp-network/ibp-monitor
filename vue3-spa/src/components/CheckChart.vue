<template>
  <div class="columns">
    <div class="column is-1 is-narrow-mobile"></div>
    <div class="column">
      <div class="chart-container" style="position: relative; height: 40vh">
        <!-- <canvas id="myChart"></canvas> -->
        <LineChart id="myChart" :options="chartOptions" :data="chartData"></LineChart>
      </div>
    </div>
    <div class="column is-1 is-narrow-mobile"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import 'chartjs-adapter-date-fns'
import { Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  LineController,
  TimeScale,
} from 'chart.js'
import { shortStash } from './utils'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  LineController,
  TimeScale
)

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

const colors = ['red', 'pink', 'green', 'blue', 'purple', 'black', 'brown', 'darkblue', 'darkgreen']

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
      default: () => {
        return []
      },
    },
    groupBy: {
      type: String,
      default: 'memberId',
    },
  },
  computed: {
    chartData(): IChartData {
      return {
        // labels: ['January', 'February', 'March'],
        // datasets: [{ data: [40, 20, 12] }]
        //labels: this.labels, // <%-JSON.stringify(labels) %>,
        /*
        datasets: [...this.datasets, {
          label: 'Service performance (ms)',
          // data: [12, 19, 3, 5, 2, 3],
          data: this.data,
          borderColor: 'darkblue',
          backgroundColor: 'blue',
          borderWidth: 2,
          lineTension: 0.2,
        }],
        */

        datasets: this.datasets,
      } as IChartData
    },
  },
  watch: {
    healthChecks() {
      this.makeChartData()
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            display: true,
            /*
            scaleLabel: {
              display: true,
              labelString: 'x',
            },*/
            time: {
              displayFormats: {
                hour: 'HH:mm',
              },
            },
          },
          y: {
            ticks: {
              beginAtZero: true,
              stepSize: 10,
              suggestedMax: 1000,
            },
            /*
            scaleLabel: {
              display: true,
              labelString: 'y',
            },
            */
          },
        },
      },
      datasets: [] as any[],
    }
  },
  methods: {
    makeChartData() {
      console.debug('makeChartData()')
      const reversed = [...this.healthChecks].reverse() || []
      const groupedData = {}
      this.datasets = []
      for (let check of reversed) {
        // @ts-ignore
        if (groupedData[check[this.groupBy]]) {
          // @ts-ignore
          groupedData[check[this.groupBy]].push(check)
        } else {
          // @ts-ignore
          groupedData[check[this.groupBy]] = [check]
        }
      }
      let index = 0
      for (let key of Object.keys(groupedData)) {
        this.datasets.push({
          label: key,
          // @ts-ignore
          data: groupedData[key].map((hc: any) => {
            return {
              x: new Date(hc.createdAt),
              y: hc.record?.performance || 0,
            }
          }),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length],
          borderWidth: 1,
          blineTension: 0.2,
        })
        index++
      }
      /*
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
      */
    },
  },
  mounted() {
    console.debug('CheckChart.vue: mounted()', this.healthChecks)
    // eslint-disable-next-line
    this.makeChartData()
    // this.healthChecks.reverse() // put it back!
  },
})
</script>
