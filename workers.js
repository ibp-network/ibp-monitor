// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()

import cfg from './config/index.js'

import express from 'express'
import { Queue, Worker } from 'bullmq'
import * as pkg1 from '@bull-board/express'
const { ExpressAdapter } = pkg1
import * as pkg2 from '@bull-board/api'
const { createBullBoard } = pkg2
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
// import axios from 'axios'

import { asyncForeach } from './lib/utils.js'
import { checkService } from './workers/f-check-service.js'
import { updateMemberships } from './workers/f-update-memberships.js'
// import { f_1kv_nominations_update } from './workers/1kv-nominations-update.js'
// import { f_1kv_nominators_update } from './workers/1kv-nominators-update.js'
// import { f_w3f_exposures_update } from './workers/w3f-exposures-update.js'
// import { f_w3f_nominators_update } from './workers/w3f-nominators-update.js'
// import { f_w3f_pools_update } from './workers/w3f-pools-update.js'
// import { f_w3f_validator_location_stats_update } from './workers/w3f-validator-location-stats-update.js'
// import { f_w3f_validators_update } from './workers/w3f-validators-update.js'
// import { f_w3f_nominations_update } from './workers/w3f-nominations-update.js'
// import { f_dock_auto_payout } from './functions/f_dock_auto_payout.js'

console.debug('cfg.redis', cfg.redis)

const qOpts = {
  // connection to Redis
  // connection: {
  //   host: "localhost",
  //   port: 6379
  // }
  connection: cfg.redis,
}

async function onError(job, err) {
  const errStr = `ERROR: ${job}: ` + typeof err === 'string' ? err : JSON.stringify(err)
  // await axios.get('http://192.168.1.2:1880/sendToTelegram?text='+ errStr)
  console.log(errStr)
}

async function onFailed(job, event) {
  const errStr = `FAILED: ${job}: ` + typeof event === 'string' ? event : JSON.stringify(event)
  // await axios.get('http://192.168.1.2:1880/sendToTelegram?text='+ errStr)
  console.log(errStr)
}

const q_checkService = new Queue('checkService', qOpts)
const q_updateMemberships = new Queue('updateMemberships', qOpts)
// const q_health_check = new Queue('health_check', qOpts)
// const q_1kv_nominators_update = new Queue('1kv_nominators_update', qOpts)
// const q_w3f_exposures_update = new Queue('w3f_exposures_update', qOpts)
// const q_w3f_nominators_update = new Queue('w3f_nominators_update', qOpts)
// const q_w3f_pools_update = new Queue('w3f_pools_update', qOpts)
// const q_w3f_validator_location_stats_update = new Queue('w3f_validator_location_stats_update', qOpts)
// const q_w3f_validators_update = new Queue('w3f_validators_update', qOpts)
// const q_w3f_nominations_update = new Queue('w3f_nominations_update', qOpts)
// const q_dock_auto_payout = new Queue('dock_auto_payout', qOpts)

const workers = [
  new Worker('checkService', checkService, { ...qOpts, concurrency: 1 }),
  new Worker('updateMemberships', updateMemberships, qOpts),
  // new Worker('health_check', f_health_check, qOpts)
  // new Worker('1kv_nominators_update', f_1kv_nominators_update, qOpts)
  // new Worker('w3f_exposures_update', f_w3f_exposures_update, qOpts)
  // new Worker('w3f_nominators_update', f_w3f_nominators_update, qOpts)
  // new Worker('w3f_pools_update', f_w3f_pools_update, qOpts)
  // new Worker('w3f_validator_location_stats_update', f_w3f_validator_location_stats_update, qOpts)
  // new Worker('w3f_validators_update', f_w3f_validators_update, qOpts)
  // new Worker('w3f_nominations_update', f_w3f_nominations_update, qOpts)
  // new Worker('dock_auto_payout', f_dock_auto_payout, qOpts)
]

const jobs = workers.map((w) => w.name)

// Call updateMemberships repeteadely
q_updateMemberships.add(
  'updateMemberships',
  {},
  {
    repeat: {
      pattern: '0 0 * * *',
    },
  }
)

// handle all error/failed
workers.forEach((worker) => {
  const job = worker.name
  worker.on('error', (err) => onError(job, err))
  worker.on('failed', (event) => onFailed(job, event))
})

// const jobRetention = {
//   removeOnComplete: {
//     age: 24 * 60 *60, // keep up to 24 hour (in millis)
//     count: 1000, // keep up to 1000 jobs
//   },
//   removeOnFail: {
//     age: 48 * 60 * 60, // keep up to 48 hours (in millis)
//   }
// }

async function clearQueue(jobname) {
  let qname = eval(`q_${jobname}`)
  await qname.pause()
  // // Removes all jobs that are waiting or delayed, but not active, completed or failed
  // await qname.drain()
  // Completely obliterates a queue and all of its contents.
  await qname.resume()
}

;(async () => {
  // on startup, drain the queues and start again
  async function clearQueues() {
    await asyncForeach(jobs, clearQueue)
  }

  // jobs will be added by server.js
  // async function addJobs() {
  // //   asyncForEach(chains, async (CHAIN, idx, arr) => {
  // //     const jOpts = { CHAIN }
  // //     await q_health_check.add(`1kv_candidates_${CHAIN}`, jOpts,
  // //       { repeat: { pattern: '00,30 * * * *' }, ...jobRetention })
  // //     // await q_1kv_nominations_update.add(`1kv_nominations_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '01,31 * * * *' }, ...jobRetention })
  // //     // await q_1kv_nominators_update.add(`1kv_nominators_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '02,32 * * * *' }, ...jobRetention })
  // //     // await q_w3f_exposures_update.add(`w3f_exposures_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '03,33 * * * *' }, ...jobRetention })
  // //     // await q_w3f_nominators_update.add(`w3f_nominators_${CHAIN}`, jOpts,
  // //     //   // once per hour
  // //     //   { repeat: { pattern: '04 * * * *' }, ...jobRetention })
  // //     // await q_w3f_pools_update.add(`w3f_pools_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '05,35 * * * *' }, ...jobRetention })
  // //     // await q_w3f_validator_location_stats_update.add(`w3f_validator_location_stats_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '06,36 * * * *' }, ...jobRetention })
  // //     // await q_w3f_validators_update.add(`w3f_validators_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '07,37 * * * *' }, ...jobRetention })
  // //     // await q_w3f_nominations_update.add(`w3f_nominations_${CHAIN}`, jOpts,
  // //     //   { repeat: { pattern: '07,37 * * * *' }, ...jobRetention })
  // //   })
  // }

  await clearQueues()
  // await addJobs()

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')
  // const queueMQ = new QueueMQ()
  const { setQueues, replaceQueues } = createBullBoard({
    queues: [
      // new BullMQAdapter(q_health_check, { readOnlyMode: false }),
      new BullMQAdapter(q_checkService, { readOnlyMode: false }),
      new BullMQAdapter(q_updateMemberships, { readOnlyMode: false }),
      // new BullMQAdapter(q_1kv_nominators_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_w3f_exposures_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_w3f_nominators_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_w3f_pools_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_w3f_validator_location_stats_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_w3f_validators_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_w3f_nominations_update, { readOnlyMode: false }),
      // new BullMQAdapter(q_dock_auto_payout, { readOnlyMode: false }),
    ],
    serverAdapter: serverAdapter,
  })
  const app = express()
  app.use('/admin/queues', serverAdapter.getRouter())
  app.listen(3000, () => {
    console.log('Running on 3000...')
    console.log('For the UI, open http://localhost:3000/admin/queues')
    // console.log('Make sure Redis is running on port 6379 by default');
  })
})()
