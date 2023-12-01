import { Logger } from '../utils.js'
import { TimeoutException } from './errors.js'

const logger = new Logger('lib:checkService:async')

/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param {Promise<any>} asyncPromise An asynchronous promise to resolve
 * @param {number} timeLimit Time limit to attempt function in milliseconds
 * @returns {Promise<any> | undefined} Resolved promise for async function call, or an error if time limit reached
 */
export async function asyncCallWithTimeout(asyncPromise, timeLimit) {
  let timeoutHandle

  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(() => reject(new TimeoutException()), timeLimit)
  })

  return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle)
    return result
  })
}

export async function retry(fn, job, maxRetries = 3, interval = 1000, attempt = 1) {
  try {
    logger.log(`attempt ${attempt}/${maxRetries}`)
    job.log(`attempt ${attempt}/${maxRetries}`)
    return await fn()
  } catch (error) {
    // typically a timeout error
    logger.error(error)
    job.log(error)

    if (attempt < maxRetries) {
      // Wait interval milliseconds before next try
      await new Promise((resolve) => setTimeout(resolve, interval))
      return retry(fn, job, maxRetries, interval, attempt + 1)
    } else {
      throw new Error('Max retries exceeded')
    }
  }
}
