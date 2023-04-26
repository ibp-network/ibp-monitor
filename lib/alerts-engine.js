import { Queue } from 'bullmq'
import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'

const cfg = Object.assign(config, configLocal)

const jobRetention = {
  timeout: 60 * 1000, // active jobs timeout after 60 seconds
  removeOnComplete: {
    age: 5 * 24 * 60 * 60, // keep up to 5 * 24 hour (in millis)
    count: 10000, // keep up to 1000 jobs
  },
  removeOnFail: {
    age: 5 * 24 * 60 * 60, // keep up to 5 * 24 hours (in millis)
  },
}

export class AlertsEngine {
  queue = undefined
  datastore = undefined
  constructor({ datastore }) {
    const queue = new Queue(cfg.alertsEngine.queueName, { connection: cfg.redis })
    this.queue = queue
    this.datastore = datastore
  }

  // evaluate alert rules and publish alerts into specific queue to be processed later
  async run(currentHealthCheck) {
    // if alerts are not enabled for the current monitor just skip
    if (!cfg.alertsEngine.enabled) {
      return 
    }
    // alert_1: verify if chain hasn't stalled by checking previous blockHeader with the latest received
    // query previous healthCheck from member and service
    const previousHealthCheck = await this.datastore.HealthCheck.findOne({
      where: { memberId: currentHealthCheck.memberId, serviceId: currentHealthCheck.serviceId },
      order: [['createdAt', 'DESC']],
      offset: 1 
    })

    if (previousHealthCheck !== null) {
      if (previousHealthCheck.record.syncState.currentBlock === currentHealthCheck.record.syncState.currentBlock) {
        console.debug('Creating new [alert] job for', currentHealthCheck.memberId, currentHealthCheck.serviceId)
        this.queue.add(
          cfg.alertsEngine.queueName,
          {
            alertCode: '100',
            severity: 'high', // low | medium | high
            message: `block header ${currentHealthCheck.record.syncState.currentBlock} hasn't changed since last health check`,
            healthChecks: [currentHealthCheck, previousHealthCheck],
          },
          { repeat: false, ...jobRetention }
        )
      }
    }

    // alert_2: verify if blockDrift is higher than the threshold defined in config
    const blockDrift = currentHealthCheck.record.syncState.currentBlock - currentHealthCheck.record.finalizedBlock
    if (blockDrift >= cfg.alertsEngine.thresholds.blockDrift) {
      console.debug('Creating new [alert] job for', currentHealthCheck.memberId, currentHealthCheck.serviceId)
      this.queue.add(
        cfg.alertsEngine.queueName,
        {
          alertCode: '101',
          severity: 'medium', // low | medium | high
          message: `finalized block drifted by ${blockDrift}`,
          healthChecks: [currentHealthCheck],
        },
        { repeat: false, ...jobRetention }
      )
    }
  }
}