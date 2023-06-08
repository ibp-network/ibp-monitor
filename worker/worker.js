import { io } from 'socket.io-client';
import { serializeError, deserializeError } from 'serialize-error';

import { checkService } from './lib/f-check-service.js';
import { checkBootnode } from './lib/f-check-bootnode.js';

import { config } from './config.js';

async function ping(job) {
  return new Promise((resolve, reject) => {
    resolve('pong');
  });
}

const jobs = {
  ping,
  checkService,
  checkBootnode,
}
// jobs.checkService = checkService;
// jobs.checkBootnode = checkBootnode;
// const capabilities = [
//   'ping',
//   'checkService',
//   // 'checkBootnode',
// ]

async function executeJob (jobName, params, callback) {
  if (!config.capabilities.includes(jobName)) {
    callback({ error: 'Job not supported' }, null);
  }
  try {
    const result = await jobs[jobName]({ data: params, log: console.log });
    callback(null, result);
  } catch (error) {
    callback({ error }, null);
  }
}

function logEvent (eventName) {
  return function (data) {
    console.log(`Event ${eventName}`, data);
  }
}
function logError (eventName) {
  return function (err) {
    console.error(`Error ${eventName}`);
    console.error(serializeError(err));
  }
}

;(async () => {

  try {
    const socket = io('http://localhost:4000', {
      query: {
        workerId: config.workerId, // 'worker-1',
        apiKey: config.apiKey, // '123123123',
        capabilities: config.capabilities,
      },
      // jsonp: false,
      // transports: ['websocket'],
    }); // replace with your server url
  
    socket
      .on('connect', logEvent('connect'))
      .on('disconnect', logEvent('connect'))
      .on('parse_error', logEvent('parse_error'))
      .on('connect_error', logError('connect_error'))
      .on('error', logError('error'))
      .on('events', function(data) {
        console.log('Received events:', data);
      })
      .on('jobs', function(data) {
        console.log('Received jobs:', data);
        const jobs = data || [];
        for(let i = 0; i < jobs.length; i++) {
          const job = jobs[i];
          console.log(`Executing job '${job.name}'`);
          executeJob(job.name, job.params, (error, result) => {
            // console.debug('job_result', error, result);
            if (error) {
              console.warn(serializeError(error));
              socket.emit('job_result', {
                job,
                error,
                result: null
              });
            } else {
              console.log('result', JSON.stringify(result));
              socket.emit('job_result', {
                job,
                error: null,
                result,
              });
            }
          });
        }
      });
  
    // this loop is to keep the process running
    const intervalId = setInterval(() => {
      // socket.emit('message', 'Hello from client')
    }, 1000);
  
    process.on('SIGINT', () => {
      console.log('SIGINT signal received.');
      clearInterval(intervalId); // Clear the interval when the process is interrupted.
      socket.disconnect();
    });
  } catch (error) {
    console.log('Error occurred:', error);
  }

})();
