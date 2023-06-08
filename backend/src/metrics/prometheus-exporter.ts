import moment from 'moment'

class PrometheusExporter {
  _ds = undefined

  constructor(datastore) {
    this._ds = datastore
  }

  // Older versions of MySQL store JSON in TEXT fields...
  _parseRecord(record = {}) {
    return typeof record === 'string' ? JSON.parse(record) : record
  }

  _calcAverage(checks = [], range = 10) {
    var ret = 0
    var chunk = checks.slice(0, range)
    // console.log(chunk)
    let count = chunk.length

    if (count > 0) {
      var sum = chunk
        .map((m) => {
          return this._parseRecord(m.record).performance || 0
        })
        .reduce((prevVal, currVal, idx, arr) => {
          return prevVal + currVal
        }, 0)
      ret = sum / count
    }
    return ret
  }

  async export(serviceId: string) {
    console.debug('PrometheusExporter.export()', serviceId)
    let lines = []
    const service = await this._ds.Service.findByPk(serviceId)
    if (!service) {
      lines.push(`# invalid serviceId: ${serviceId}`)
    } else {
      const errorCount = (
        await this._ds.HealthCheck.findAll({
          where: { serviceId, status: 'error' },
          order: [['id', 'DESC']],
        })
      ).length
      lines.push('# HELP ibp_service_error_count')
      lines.push('# TYPE ibp_service_error_count counter')
      lines.push(`ibp_service_error_count{serviceId="${serviceId}"} ${errorCount || 0}`)
      const checks = await this._ds.HealthCheck.findAll({
        where: { serviceId },
        order: [['id', 'DESC']],
        limit: 100,
      })
      // averages: 10, 50, 100
      let check = checks[0] || {}
      const record = this._parseRecord(check.record || {})
      lines.push('# HELP ibp_service_performance_1 performance for latest check')
      lines.push('# TYPE ibp_service_performance_1 gauge')
      lines.push(
        `ibp_service_performance_1{serviceId="${serviceId}", timestamp="${moment
          .utc(check.createdAt)
          .valueOf()}"} ${record?.performance || 0}`
      )
      let avg = this._calcAverage(checks, 10)
      lines.push('# HELP ibp_service_performance_10 average performance over past 10 checks')
      lines.push('# TYPE ibp_service_performance_10 gauge')
      lines.push(`ibp_service_performance_10{serviceId="${serviceId}"} ${avg}`)
      avg = this._calcAverage(checks, 50)
      lines.push('# HELP ibp_service_performance_50 average performance over past 50 checks')
      lines.push('# TYPE ibp_service_performance_50 gauge')
      lines.push(`ibp_service_performance_50{serviceId="${serviceId}"} ${avg}`)
      avg = this._calcAverage(checks, 100)
      lines.push('# HELP ibp_service_performance_100 average performance over past 100 checks')
      lines.push('# TYPE ibp_service_performance_100 gauge')
      lines.push(`ibp_service_performance_100{serviceId="${serviceId}"} ${avg}`)

      // api.rpc.system.peers() is an unsafe RPC method
      // api.rpc.net.peerCount returns undefined...
      // TODO peerCount
      // lines.push('# HELP ibp_service_peer_count number of peers connected at latest check')
      // lines.push('# TYPE ibp_service_peer_count gauge')
      // lines.push(`ibp_service_peer_count{serviceId="${serviceId}"} ${record.peerCount || 0}`)

      // lines.push(`ibp_monitor{serviceId="${serviceId}"} 0`)
      // checks.forEach(hc => {
      //   // console.debug(hc)
      //   const record = this._parseRecord(hc.record)
      //   lines.push(`ibp_service_performance{serviceId="${serviceId}", timestamp="${moment.utc(hc.createdAt).valueOf()}"} ${record?.performance || 0}`)
      // });
    }
    // console.debug(lines)
    return lines.join('\n')
  }
}

export { PrometheusExporter }
