'use strict'

import axios from 'axios'

import { config } from '../config/config.js'
import { config as configLocal } from '../config/config.local.js'
const cfg = Object.assign(config, configLocal)

export async function processAlert(job) {
  // console.log('job.data', job.data);
  const { code, memberId, serviceId } = job.data
  console.log('[worker] processAlert start...', code, memberId, serviceId)
  
  try {
    const {data} = await axios.post(cfg.alertsEngine.webhook, job.data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('[worker] processAlert done...', code, memberId, serviceId)
    job.log(`Alert code: ${code} processed`)
    return data

  } catch (err) {
    console.warn('[worker] WE GOT AN ERROR --------------')
    console.error(err)
    job.log(err)
    throw new Error(err)
  }
}
