const alertCodes = {
  100 : {
    code: 100,
    severity: 'high', // low | medium | high
    message: (cuurentBlockNumber) => `block header ${cuurentBlockNumber} hasn't changed since last health check`
  },
  101 : {
    code: 101,
    severity: 'medium', // low | medium | high
    message: (blockDrift) => `finalized block drifted by ${blockDrift}`,
  }
}

export class AlertsEngine {
  queue = undefined
  datastore = undefined
  constructor({ queue, datastore }) {
    this.queue = queue
    this.datastore = datastore
  }

  // evaluate alert rules and publish alerts into specific queue to be processed later
  async run(healthCheckResult) {
    console.log("__alertEngine run", healthCheckResult);
    // alert_1: verify if chain hasn't stalled by checking previous blockHeader with the latest received
    // query previous healthCheck from member and service
    const previousHealthCheck = await this.datastore.HealthCheck.findOne({
      where: { memberId: healthCheckResult.memberId, serviceId: healthCheckResult.serviceId },
      order: [['createdAt', 'DESC']],})

  }
}

// const runAlertRuler = (queue, datastore, healthChecher) => {
//   // alert_1: verify if chain hasn't stalled by checking previous blockHeader with the latest received
//   if (previousHealthCheck !== null) {
//     if (previousHealthCheck.record.syncState.currentBlock === result.record.syncState.currentBlock) {
//       console.debug('Creating new [alert] job for', member.id, service.id)
//       alertsQueue.add(
//         'alert',
//         {
//           subdomain: service.membershipLevel.subdomain,
//           member,
//           service,
//           monitorId: peerId.toString(),
//           alertCode: '100',
//           severity: 'high', // low | medium | high
//           message: `block header ${result.record.syncState.currentBlock} hasn't changed since last health check`
//         },
//         { repeat: false, ...jobRetention }
//       )
//     }
//   }
//   // alert_2: verify if blockDrift is higher than the threshold defined in config
//   const blockDrift = result.record.syncState.currentBlock - result.record.syncState.finalizedBlock
//   if (blockDrift >= cfg.performance.blockDriftThreshold) {
//     console.debug('Creating new [alert] job for', member.id, service.id)
//     alertsQueue.add(
//       'alert',
//       {

//         subdomain: service.membershipLevel.subdomain,
//         member,
//         service,
//         monitorId: peerId.toString(),
//         alertCode: '101',
//         severity: 'medium', // low | medium | high
//         message: `finalized block drifted by ${blockDrift}`,
//         healthChecks: [result],
//       },
//       { repeat: false, ...jobRetention }
//     )
//   }
// }