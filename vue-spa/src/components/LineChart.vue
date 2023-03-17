<script>
import mixins, { Line } from 'vue-chartjs'

export default Line.extend({
  mixins: [mixins?.reactiveProp],
  props: ['options'],
  mounted () {
    this.renderChart(this.chartData, { responsive: true, maintainAspectRatio: false })
  }
})
</script>
