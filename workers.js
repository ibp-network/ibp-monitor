import cfg from './config/index.js'

import express from 'express'
import { Queue, Worker } from 'bullmq'
import * as pkg1 from '@bull-board/express'
const { ExpressAdapter } = pkg1
import * as pkg2 from '@bull-board/api'
const { createBullBoard } = pkg2
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'

import { asyncForeach } from './lib/utils.js'
import { checkService } from './workers/f-check-service.js'
import { updateMemberships } from './workers/f-update-memberships.js'

console.debug('cfg.redis', cfg.redis)

const qOpts = {
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

const workers = [
  new Worker('checkService', checkService, { ...qOpts, concurrency: 1 }),
  new Worker('updateMemberships', updateMemberships, qOpts),
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

  await clearQueues()

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')
  // const queueMQ = new QueueMQ()
  const { setQueues, replaceQueues } = createBullBoard({
    queues: [
      new BullMQAdapter(q_checkService, { readOnlyMode: false }),
      new BullMQAdapter(q_updateMemberships, { readOnlyMode: false }),
    ],
    serverAdapter: serverAdapter,
  })
  const app = express()
  app.use('/admin/queues', serverAdapter.getRouter())
  app.listen(3000, () => {
    console.log('Running on 3000...')
    console.log('For the UI, open http://localhost:3000/admin/queues')
  })
})()
