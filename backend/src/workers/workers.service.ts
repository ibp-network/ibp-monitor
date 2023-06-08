import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
    private readonly libp2pService: Libp2pService,
    private readonly workersGateway: WorkersGateway,
  ) {}

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
  }

  handleDisconnect(client: any) {
    this.logger.debug('handleDisconnect', client);
    if (this.workers.delete(client.id)) {
      this.logger.debug('worker disconnected', client.id);
    }
  }

  findAll(): Map<string, any> {
    return this.workers;
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
