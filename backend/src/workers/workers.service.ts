import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { emitter } from '../models/event-emitter.js';
import { Socket } from 'socket.io';
import { Sequelize } from 'sequelize-typescript';
import { PeerId } from '@libp2p/interface-peer-id';

import { Libp2pService } from '../libp2p/libp2p.service.js';
import { HealthCheck } from '../models/health-check.js';
import { Member } from '../models/member.js';
import { Service } from '../models/service.js';
import { WorkersGateway } from './workers.gateway.js';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

@Injectable()
export class WorkersService {
  private readonly logger = new Logger('WorkersService');
  private workers = new Map<string, any>();

  private subscriptions: Record<string, string[]> = {};

  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
    // private eventEmitter: EventEmitter2,
    private readonly libp2pService: Libp2pService,
    private readonly workersGateway: WorkersGateway,
  ) {
    // TODO is there a better way to listen for events?
    emitter.on('healthCheck_created', (healthCheck: HealthCheck) => {
      // this.logger.debug('healthCheck_created', healthCheck.toJSON());
      this.handleHealthCheckCreated(healthCheck);
    });
  }

  getPeerId(): PeerId {
    return this.libp2pService.getPeerId();
  }

  async getServices(): Promise<Service[]> {
    this.logger.debug('getServices');
    return (await this.sequelize.models.Service.findAll({
      where: { type: 'rpc', status: 'active' },
      include: ['membershipLevel'],
    })) as Service[];
  }
  
  async getMembers(): Promise<Member[]> {
    this.logger.debug('getMembers');
    var members = [];
    try {
      members = (await this.sequelize.models.Member.findAll({
        where: { status: 'active' },
        include: ['membershipLevel'],
      })) as Member[];
    } catch (error) {
      this.logger.error('getMembers', error);
    }
    return members;
  }

  handleConnection(client: Socket) {
    // console.log('handleConnection', client.id, args);
    const { workerId = 'unknown', capabilities = [] } = client.handshake.query;
    this.logger.debug(
      `handleConnection: id: ${client.id} name: ${workerId} caps: ${capabilities}`,
    );
    // the gateway will check if client is allowed to connect
    this.workers.set(client.id, client);

    const sub_events = ['healthCheck', 'member', 'service', /* other events */];
    for (const event of sub_events) {
      client.on(`subscribe_${event}`, (payload) => {
        this.handleSubscribe(event, client, payload);
      });
      client.on(`unsubscribe_${event}`, (payload) => {
        this.handleUnsubscribe(event, client, payload);
      });
    }
  }

  handleDisconnect(client: any) {
    this.logger.debug('handleDisconnect', client);
    if (this.workers.delete(client.id)) {
      this.logger.debug('worker disconnected', client.id);
    }
  }

  /**
   * 
   * @param event - e.g. 'subscribe_healthCheck'
   * @param client - client is a Socket,
   * @param payload 
   */
  handleSubscribe(event: string, client: any, payload: any): void {
    this.logger.debug('handleSubscribe', client.id, event, payload);
    if (!this.subscriptions[event]) {
      // If this is the first subscription to this event, start listening for the event.
      this.subscriptions[event] = [];
      // modelEventEmitter.on(event, (data) => {
      //   for (const id of this.subscriptions[event]) {
      //     this.server.to(id).emit(event, data);
      //   }
      // });
    }
    // Add the client to the list of clients subscribed to this event.
    this.subscriptions[event].push(client.id);
  }
  
  handleUnsubscribe(event: string, client: any, payload: any): void {
    this.logger.debug('handleSubscribe', client.id, event, payload);
    if (this.subscriptions[event]) {
      // Remove the client from the list of clients subscribed to this event.
      this.subscriptions[event] = this.subscriptions[event].filter(id => id !== client.id);

      // if (this.subscriptions[event].length === 0) {
      //   // If there are no more clients subscribed to this event, stop listening for it.
      //   delete this.subscriptions[event];
      //   modelEventEmitter.removeAllListeners(event);
      // }
    }
  }

  findAll(): Map<string, any> {
    return this.workers;
  }

  @OnEvent('healthCheck_created')
  async handleHealthCheckCreated(data: any) {
    // for each subscription to this event
    // send the data to the client
    // this.logger.debug('handleHealthCheckCreated', data);
    this.subscriptions['healthCheck']?.forEach((id) => {
      // this.workers.get(id).emit('healthCheck', data);
      this.workersGateway.sendToClient(id, 'healthCheck', data);
    });
  }

  // Event managed in TasksService
  @OnEvent('createJobsForWorkers')
  async handleCreateJobsForWorkers() {
    this.logger.debug('handleRunJobsOnWorkers');

    const peerId = this.getPeerId();
    const members = await this.getMembers();
    const services = await this.getServices();
    const jobs = [];

    for (let service of services) {
      for (let member of members) {
        if (member.membershipLevelId < service.membershipLevelId) {
          continue
        }

        console.debug('Creating new [checkService] job for', member.id, service.id)
        jobs.push({
          name: 'checkService',
          params: {
            subdomain: service.membershipLevel.dataValues.subdomain,
            member,
            service,
            monitorId: peerId.toString(),
          },
          // { repeat: false, ...jobRetention }
        })
      }
    }

    this.workersGateway.submitJobs(jobs);
  }

  async handleJobResult(data: any) {
    this.logger.debug('handleJobResult', JSON.stringify(data));
    const { job, error, result } = data;
    //this.eventEmitter.emit('jobResult', { job, error, result });
    if (error) {
      this.logger.error(`jobResult: ${job.name} failed`, error);
    } else {
      switch (job.name) {
        case 'checkService':
        case 'checkBootnode':
          const hc = (await this.sequelize.models.HealthCheck.create(
            result,
          )) as HealthCheck;
          this.logger.debug(`jobResult: ${job.name} created`, hc.id);
          // const rpcReq: Libp2pRpcRequest = {
          //   method: 'healthCheck',
          //   params: result,
          // };
          // const resp = await this.zmq.rpcAsync(rpcReq);
          const resp = await this.libp2pService.publish('/ibp/healthCheck', uint8ArrayFromString(JSON.stringify(result)));
          this.logger.debug(`publish: healthCheck`, resp);
          break;
        default:
          this.logger.warn(`jobResult: ${job.name} not handled`);
      }
    }
  }
}
