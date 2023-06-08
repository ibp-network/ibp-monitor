import { ModuleRef } from '@nestjs/core';
import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Sequelize } from 'sequelize-typescript';

import { WorkersService } from './workers.service.js';
import config from '../../config/config.js';
import { Member } from '../models/member.js';
import { Service } from '../models/service.js';

interface JobSpec {
  name: string;
  params: {
    subdomain: string;
    member: Member;
    service: Service;
    monitorId: string;
  },
  options: any;
}

interface ActiveJob {
  memberId: string;
  serviceId: string;
  createdAt: Date;
}

/*
  monitorId,
  serviceId: service.id,
  memberId: member.id,
  peerId: peerId.toString(),
  source: 'check',
  type: 'service_check',
  status: timing > (cfg.performance?.sla || 500) ? 'warning' : 'success',
  responseTimeMs: timing,
  record: {
    monitorId,
    memberId: member.id,
    serviceId: service.id,
    endpoint,
    ipAddress: member.serviceIpAddress,
    chain,
    chainType,
    health,
    networkState,
    syncState,
    version,
    // peerCount,
    performance: timing,
  },
*/

interface JobResult {
  serviceId: string;
  memberId: string;
  peerId?: string;
  source?: string;
  type: string;   // 'service_check' | 'bootnode_check'
  status: string; // 'success' | 'warning' | 'error'
  responseTimeMs?: number;
  record: any;
}

interface JobResultResponse {
  job: JobSpec;
  error: any;
  result: JobResult;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WorkersGateway {
  private readonly logger = new Logger('WorkersGateway');
  private workersService: WorkersService;
  protected workers: Map<string, Socket> = new Map();
  protected jobs: Map<string, any> = new Map();

  constructor(
    private moduleRef: ModuleRef,
    private eventEmitter: EventEmitter2,
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {
    // // TODO DELETE ME TEST
    // setInterval(() => {
    //   this.sendEvent('jobs', [
    //     { name: 'ping', params: {} },
    //     // {
    //     //   name: 'checkService',
    //     //   params: {
    //     //     subdomain: 'rpc',
    //     //     member: { id: 'metaspan', serviceIpAddress: '195.144.22.130' },
    //     //     service: { id: 'kusama-rpc', serviceUrl: '/kusama', chainId: 'kusama' },
    //     //     monitorId: '12D3KooWSAdKceyWnAB97AoWKRxbUv3hpAxg3eJLpLGV5za1wJsu',
    //     //   },
    //     // },
    //     {
    //       name: 'checkService',
    //       params: {
    //         subdomain: 'rpc',
    //         member: { id: 'metaspan', serviceIpAddress: '195.144.22.130' },
    //         service: { id: 'kusama-rpc', serviceUrl: '/kusama', chainId: 'kusama' },
    //         monitorId: '12D3KooWSAdKceyWnAB97AoWKRxbUv3hpAxg3eJLpLGV5za1wJsu',
    //       },
    //     },
    //   ]);
    // }, 60 * 1000);
  }

  async onModuleInit() {
    // circular dependency between WorkersGateway and WorkersService
    this.workersService = this.moduleRef.get<WorkersService>(WorkersService);
  }

  submitJobs(jobs: JobSpec[]) {
    this.logger.debug('submitJobs');  
    const newJobs = []
    for (const job of jobs) {
      this.logger.debug(job);
      const { member, service } = job.params
      const key = `${member.id}-${service.id}`
      if (this.jobs.has(key)) {
        this.logger.warn('WARNING: active job, skipping check for ', member.id, service.id)
        // check if the job is stale?
        const [activeJob, createdAt] = this.jobs.get(key)
        if(createdAt < new Date(Date.now() - 2 * 60 * 1000)) { // 2 minutes
          this.logger.warn('WARNING: stale job, deleting job for ', member.id, service.id)
          this.jobs.delete(key)
        }  
      }
      if (!this.jobs.has(key)) {
        this.jobs.set(key, [job, Date.now()])
        newJobs.push(job)
      }
    }
    this.sendEvent('jobs', newJobs);
  }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    // console.log('handleConnection', client.id, args);
    this.logger.debug('handleConnection', client.id); // , client.handshake.query);
    // TODO check if client is allowed to connect
    const { apiKey, workerId, capabilities = [] } = client.handshake.query;
    if (apiKey !== config.workers.apiKey) {
      this.logger.debug('handleConnection: invalid apiKey', apiKey);
      client.emit('error', 'invalid apiKey');
      client.disconnect();
      return;
    } else {
      this.logger.debug(
        `handleConnection from worker ${workerId}`,
        capabilities,
      );
      this.workersService.handleConnection(client);
      this.workers.set(client.id, client);
      // client.emit('jobs', [
      //   { name: 'ping', params: {} },
      //   { name: 'ping', params: {} },
      // ]);
    }
  }

  handleDisconnect(client: any) {
    this.logger.debug('handleDisconnect', client);
    if (this.workers.delete(client.id)) {
      this.workersService.handleDisconnect(client);
      this.logger.debug('worker disconnected', client.id);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.logger.debug('handleMessage', client.id, payload);
    return 'Hello world!';
  }

  @SubscribeMessage('job_result')
  async handleJobResult(@MessageBody() data: any) {
    this.logger.debug('handleJobResult', JSON.stringify(data));
    const { job, error, result } = data as JobResultResponse;
    const { member, service } = job.params;
    const key = `${member.id}-${service.id}`;
    if (!this.jobs.has(key)) {
      this.logger.warn('WARNING: response for unknown job', key);
    }
    this.jobs.delete(key);

    // TODO decide if we want to raise an event or async handle here
    //this.eventEmitter.emit('jobResult', { job, error, result });
    await this.workersService.handleJobResult(data);
  }

  // @SubscribeMessage('events')
  // handleEvent(@MessageBody() data: string): string {
  //   return data;
  // }

  /**
   * Send event to all workers
   * @param event 
   * @param data 
   */
  sendEvent(event: string, data: any) {
    this.logger.debug(`sendEvent: ${event}`, JSON.stringify(data));
    if (event === 'jobs') {
      // check if worker is capable of handling this job
      const jobs = Array.isArray(data) ? data : [data];
      this.logger.debug('jobs', jobs);
      jobs.forEach((job) => {
        const { name, params } = job;
        this.workers.forEach((worker) => {
          const { workerId, capabilities = [] } = worker.handshake.query;
          if (capabilities?.includes(name)) {
            const heard = worker.emit(event, [job]);
            this.logger.debug(
              `sendEvent: ${event}[${name}] to ${
                heard ? 'ok' : 'NOK'
              } to ${workerId}`,
            );
          } else {
            this.logger.warn(
              `sendEvent: ${event}[${name}] not sent to ${workerId} (not capable)`,
            );
          }
        });
      });
    } else {
      const recipients = this.server.emit(event, data);
      this.logger.debug(
        `sendEvent: ${event} to ${recipients ? 'some' : 'no'} recipients`,
      );
    }
  }
}
