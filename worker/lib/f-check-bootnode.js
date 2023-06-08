'use strict'

import { serializeError } from 'serialize-error'
import fs from 'fs'
import axios from 'axios'
import { spawn } from 'child_process'
import split2 from 'split2'
import moment from 'moment'
import path from 'path'
const __dirname = path.resolve()

import { config as cfg } from '../config.js'

class TimeoutException extends Error {
  constructor(message) {
    super(message)
    this.name = 'TimeoutException'
  }
}

const TIMEOUT = 300 * 1000; // nn seconds, in milliseconds
const ECHOLOG = false;
// DEBUG: minumum is 'info', we need info to see log messages!
const DEBUG = '-linfo'
// const DEBUG = '-lsync=debug,gossip=debug,peerset=debug,sub-libp2p=info' // '-ldebug'
// const DEBUG = '-ldebug' // VERY verbose, kills the terminal
const DATEFORMAT = cfg.dateTimeFormat; // 'YYYY-MM-DD HH:mm:ss'; // '2023-05-19 13:34:09 |'

// let activeMembers = [
//   // 'amforc',
//   // 'dwellir',
//   'metaspan',
//   // 'gatotech',
//   // 'helikon',
//   // 'polkadotters',
//   // 'stakeplus',
//   // 'turboflakes',
// ]

let relayChains = {
  polkadot: 'wss://rpc.ibp.network/polkadot', // 'ws://192.168.1.92:30325',
  kusama:   'wss://rpc.ibp.network/kusama',   // 'ws://192.168.1.92:40425',
  westend:  'wss://rpc.ibp.network/westend',  // 'ws://192.168.1.92:32015'
}

// let chains = ['polkadot', 'kusama', 'westend']
// let paraChains = {
//   'statemint':            'polkadot',
//   'collectives-polkadot': 'polkadot',
//   // 'bridge-hub-polkadot':  'polkadot', // not formal yet
//   'statemine':            'kusama',
//   // 'collectives-kusama':   'kusama',
//   'bridge-hub-kusama':    'kusama',
//   'westmint':             'westend',
//   'collectives-westend':  'westend',
//   // 'bridge-hub-westend':   'westend',
//   // 'encointer-polkadot':   'polkadot',
//   'encointer-kusama':     'kusama',
//   // 'encointer-westend':    'westend',
// }

const chainSpecUrl = 'https://raw.githubusercontent.com/ibp-network/config/main/chain-spec/%CHAIN%.json'

// const binDir = __dirname + '/bin'
// Same dir for docker and local
const binDir = cfg.binDir || '/usr/local/bin'

let commands = {
  polkadot: {
    // exec: `${baseDir}/paritytech/polkadot/target/release/polkadot`,
    exec: `${binDir}/polkadot`,
    // params: '--chain %CHAIN% --tmp --name IBP_Bootnode_Test --reserved-only --reserved-nodes %ENDPOINT% --no-mdns --no-hardware-benchmarks'
    params: `${DEBUG} --chain %CHAIN% --tmp --name IBP_Bootnode_Test --bootnodes %ENDPOINT% --no-mdns --no-hardware-benchmarks`
  },
  // kusama: '/path/to/polkadot',
  // westend: '/path/to/polkadot',
  parachain: {
    // exec: `${baseDir}/paritytech/cumulus/target/release/polkadot-parachain`,
    exec: `${binDir}/polkadot-parachain`,
    // params: '--chain %CHAIN% --tmp --reserved-only --reserved-nodes %ENDPOINT% --no-mdns --no-hardware-benchmarks --relay-chain-rpc-urls %RELAYCHAIN%'
    params: `${DEBUG} --chain %CHAIN% --tmp --name IBP_Bootnode_Test --bootnodes %ENDPOINT% --no-mdns --no-hardware-benchmarks --relay-chain-rpc-urls %RELAYCHAIN%`
  },
  encointer: {
    // exec: `${baseDir}/encointer/encointer-parachain/target/release/encointer-collator`,
    exec: `${binDir}/encointer-collator`,
    // params: '--chain encointer-kusama --tmp --reserved-only --reserved-nodes %ENDPOINT% --relay-chain-rpc-urls %RELAYCHAIN%'
    params: `${DEBUG} --chain encointer-kusama --name IBP_Bootnode_Test --tmp --bootnodes %ENDPOINT% --no-mdns --no-hardware-benchmarks --relay-chain-rpc-urls %RELAYCHAIN%`
  },
}

// let bootNodes = JSON.parse(fs.readFileSync('bootnodes.json', 'utf8'));

async function getChainSpec(chainId) {
  console.debug(ts(), 'getChainSpec()', chainId);
  return new Promise(async (resolve, reject) => {
    const specFile = __dirname + `/config/chain-spec/${chainId}.json`;
    if (!fs.existsSync(specFile)) {
      const url = chainSpecUrl.replace('%CHAIN%', chainId);
      const ret = await axios.get(url);
      if (!ret.data) {
        reject(`Cannot fetch chain spec from ${url}`);
      } else {
        fs.writeFileSync(specFile, JSON.stringify(ret.data, null, 2), 'utf8');
      }
    }
    resolve()
  })
}

function ts() {
  return moment().format(`${DATEFORMAT} |`);
}

async function testChain(job, { chainId, commandId, memberId, endpoint, relayChain }) {
  return new Promise(async (resolve, reject) => {
    try {
      await getChainSpec(chainId);
    } catch (err) {
      console.error(ts(), '🔴 ERROR', err);
      job.log(serializeError(err));
      reject({ err });
    }
    const command = commands[commandId]
    console.debug(ts(), '🧪 Starting test:', memberId, chainId, commandId);
    job.log(`🧪 Starting test: ${memberId} ${chainId} ${commandId} ${endpoint}`);
    const args = command.params
      .replace('%CHAIN%', chainId)
      .replace('%ENDPOINT%', endpoint)
      .replace('%RELAYCHAIN%', relayChain) // has no effect on system chain
      .split(' ');

    const logs = [];
    const polkadotProcess = spawn(command.exec, args);
    const timeout = setTimeout(() => {
      polkadotProcess.kill();
      end = moment();
      console.log(ts(), '🏁 test not complete after', end.diff(start, 'seconds'), 'seconds');
      console.debug('-'.repeat(80));
      console.debug(command.exec, args.join(' '));
      console.debug('-'.repeat(80));
      reject({ err: new Error('Timeout'), logs });
    }, TIMEOUT);

    polkadotProcess.on('error', (err) => {
      logs.push(err);
      console.error(ts(), '🔴 ERROR', err);
      job.log(err);
      clearTimeout(timeout);
      reject({err, logs});
    })

    var maxPeers = 0;
    var start = moment();
    var end = moment();
    function matchData(data) {
      const log = data.toString();
      logs.push(log);
      if(ECHOLOG){
        console.log(log); // already includes timestamp
        job.log(log);
      }
      // match on number of peers and syncing
      // 2023-05-16 10:11:43 ⚙️  Syncing, target=#15545644 (1 peers), best: #2698 (0x8c62…9f3f), finalized #2560 (0x81f3…fc71), ⬇ 210.7kiB/s ⬆ 2.7kiB/s  
      const match = log.match(/\((\d+) peers\)/);
      const numPeers = match ? parseInt(match[1]) : 0;
      if (numPeers > maxPeers) {
        maxPeers = numPeers;
        end = moment();
        console.log(ts(), `⏳ (${maxPeers} peers)`, 'after', end.diff(start, 'seconds'), 'seconds');
        job.log(`⏳ (${maxPeers} peers) after ${end.diff(start, 'seconds')} seconds`);
      }
      var success = ['parachain','encointer'].includes(commandId)
        ? log.includes('[Parachain]') && log.includes('Syncing') && numPeers > 1
        : log.includes('Syncing') && numPeers > 1;
      if (success) {
        clearTimeout(timeout);
        polkadotProcess.kill();
        // syncing = false;
        // gotPeers = false;
        end = moment();
        console.log(ts(), '🏁 test complete after', end.diff(start, 'seconds'), 'seconds');
        job.log(`🏁 test complete after ${end.diff(start, 'seconds')} seconds`);
        resolve({err: null, logs});
      }
    }

    polkadotProcess.stderr.pipe(split2()).on('data', matchData);
    polkadotProcess.stdout.pipe(split2()).on('data', matchData);

  });
}

// async function testParaChain({ paraChainId, commandId, memberId, endpoint, relayChain }) {
//   return new Promise((resolve, reject) => {
    
    
    
    
    
    
//     const command = commands[commandId]
//     console.debug(ts(), '🧪 Starting test for:', memberId, paraChainId, commandId);
//     const args = command.params
//       .replace('%CHAIN%', paraChainId)
//       .replace('%ENDPOINT%', endpoint)
//       .replace('%RELAYCHAIN%', relayChain)
//       .split(' ');

//     const logs = [];
//     const polkadotProcess = spawn(command.exec, args);
//     const timeout = setTimeout(() => {
//       polkadotProcess.kill();
//       end = moment();
//       console.log(ts(), '🏁 test NOT complete after', end.diff(start, 'seconds'), 'seconds');
//       console.debug('-'.repeat(80));
//       console.debug(command.exec, args.join(' '));
//       console.debug('-'.repeat(80));
//       reject(new Error('Timeout'));
//     }, TIMEOUT);

//     polkadotProcess.on('error', (err) => {
//       console.error(ts(), '🔴 ERROR', err);
//       reject(err);
//     })

//     var maxPeers = 0;
//     var start = moment();
//     var end = moment();
//     function matchData(data) {
//       const log = data.toString();
//       logs.push(log);
//       if (ECHOLOG) console.log(log); // already includes timestamp
//       // match on number of peers and syncing
//       // 2023-05-16 10:11:43 ⚙️  Syncing, target=#15545644 (1 peers), best: #2698 (0x8c62…9f3f), finalized #2560 (0x81f3…fc71), ⬇ 210.7kiB/s ⬆ 2.7kiB/s  
//       const match = log.match(/\((\d+) peers\)/);
//       const numPeers = match ? parseInt(match[1]) : 0;
//       if (numPeers > maxPeers) {
//         maxPeers = numPeers;
//         end = moment();
//         console.log(ts(), `⏳ (${maxPeers} peers)`, 'after', end.diff(start, 'seconds'), 'seconds')
//       }
//       if (log.includes('[Parachain]') && log.includes('Syncing') && numPeers > 1) {
//         clearTimeout(timeout);
//         polkadotProcess.kill();
//         syncing = false
//         gotPeers = false
//         end = moment();
//         console.log(ts(), '🏁 test complete after', end.diff(start, 'seconds'), 'seconds');
//         resolve();
//       }
//     }

//     polkadotProcess.stderr.pipe(split2()).on('data', matchData);
//     polkadotProcess.stdout.pipe(split2()).on('data', matchData);

//     polkadotProcess.on('error', (err) => {
//       clearTimeout(timeout);
//       reject(err);
//     });
//   });
// }

// async function testChains() {
//   for (let i = 0; i < chains.length; i++) {
//     const chain = chains[i]
//     console.log(ts(), '🔗 chain', chain)
//     const test = bootNodes[chain]
//     // console.log('test', test)
//     const { commandId, members } = test
//     const memberIds = Object.keys(members)
//     // console.log('memberIds', memberIds)
//     for (let j = 0; j < memberIds.length; j++) {
//       const memberId = memberIds[j]
//       if (!activeMembers.includes(memberId)) continue
//       const endpoints = members[memberId]
//       for (let k = 0; k < endpoints.length; k++) {
//         const endpoint = endpoints[k]
//         const node = { chain, commandId, memberId, endpoint }
//         // console.log(node)
//         try {
//           await testChain(node)
//           console.log(ts(), '✅', memberId, chain, endpoint)
//         } catch (err) {
//           console.log(ts(), '❌', memberId, chain, endpoint)
//         }
//       }
//     }
//   }
// }

// async function testParaChains() {
//   const paraChainIds = Object.keys(paraChains)
//   for (let i = 0; i < paraChainIds.length; i++) {
//     const paraChainId = paraChainIds[i]
//     const chainId = paraChains[paraChainId]
//     const relayChain = relayChains[chainId]
//     console.log(ts(), '🔗 parachain', paraChainId, chainId, relayChain)
//     const test = bootNodes[paraChainId]
//     // console.log('test', test)
//     const { commandId, members } = test
//     const memberIds = Object.keys(members)
//     // console.log('memberIds', memberIds)
//     for (let j = 0; j < memberIds.length; j++) {
//       const memberId = memberIds[j]
//       if (!activeMembers.includes(memberId)) continue
//       const endpoints = members[memberId]
//       for (let k = 0; k < endpoints.length; k++) {
//         const endpoint = endpoints[k]
//         const node = { paraChainId, commandId, memberId, endpoint, relayChain }
//         // console.log(node)
//         try {
//           await testParaChain(node)
//           console.log(ts(), '✅', memberId, paraChainId, endpoint)
//         } catch (err) {
//           console.log(ts(), '❌', memberId, paraChainId, endpoint)
//         }
//       }
//     }
//   }

// }


/**
 * Similar to healthCheck-endpoint, but for IBP url at member.services_address
 * @param {} job
 * @returns
 */
export async function checkBootnode(job) {
  // Will print { foo: 'bar'} for the first job
  // and { qux: 'baz' } for the second.
  // console.log('job.data', job.data);
  const peerId = container.resolve('peerId')
  const ds = container.resolve('datastore')

  var { chainId, member, service, endpoint, commandId, relayChain, monitorId } = job.data
  console.debug('[worker] checkBootnode', member.id, service.id)

  // const testDef = bootNodes[service.id]
  // var endpoints = endpoints = testDef.members[member.id] || []
  if (!relayChain) relayChain = relayChains[chainId]

  var timeout = null
  var result
  var logs = []
  // var peerId = ''
  // TODO different types of service? http / substrate / ...?
  try {
    job.log(`checkBootnode: ${chainId}, ${member.id}, ${service.id}, ${endpoint}, ${relayChain}, ${monitorId}`)

    // start
    var start = performance.now()
    logs = await testChain(job, { chainId, commandId, memberId: member.id, endpoint, relayChain, monitorId })
    var end = performance.now()
    // end timer

    const timing = end - start
    // console.debug(health.toString())
    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck messate
      monitorId: peerId.toString(),
      serviceId: service.id,
      memberId: member.id,
      // peerId: peerId.toString(), // TODO work this out from multiaddr
      source: 'check',
      type: 'bootnode_check',
      status: 'success', // if we got here, it worked
      responseTimeMs: timing,
      record: {
        monitorId: peerId.toString(),
        memberId: member.id,
        serviceId: service.id,
        endpoint,
        ipAddress: member.serviceIpAddress,
        chain: chainId,
        // peerCount,
        performance: timing,
      },
    }
    // not here, we'll do it in the app-server
    // await this.datastore.Service.update({ status: 'online' }, { where: { serviceUrl: service.serviceUrl } })
    // save healthCheck in storage
    // console.debug('checkBootnode() done 1')
  } catch (err) {
    console.warn('[worker] WE GOT AN ERROR --------------')
    console.error(err)
    job.log('WE GOT AN ERROR --------------')
    job.log(err)
    job.log(err.toString())
    // mark the service errorCount
    // result = await this.handleGenericError(err, service, peerId)
    result = {
      // our peerId will be added by the receiver of the /ibp/healthCheck message
      monitorId: peerId?.toString(),
      serviceId: service.id,
      memberId: member.id,
      // peerId: peerId?.toString() || null, // TODO work this out from multiaddr
      source: 'check',
      type: 'bootnode_check',
      status: 'error',
      responseTimeMs: -1,
      record: {
        monitorId: peerId?.toString(),
        memberId: member.id,
        serviceId: service.id,
        endpoint,
        error: serializeError(err),
        performance: -1,
      },
    }
  } finally {
    if (timeout) clearTimeout(timeout)
    console.log('[worker] checkBootnode done...', member.id, service.id)
    job.log('checkBootnode done...', member.id, service.id)
    await ds.HealthCheck.create(result)
    return result
  }
}
