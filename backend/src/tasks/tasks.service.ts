import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

import axios from 'axios';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import moment from 'moment';

import config from '../../config/config.js';

import { MembersDef, ServicesDef } from './tasks.interfaces.js';
import { Tasks } from './tasks.js';

/*
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | months
  | | | day of month
  | | hours
  | minutes
  seconds (optional)
*/

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly tasks: Tasks;

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private eventEmitter: EventEmitter2,
  ) {
    this.tasks = new Tasks(this.logger, this.sequelize);
    this.readMembers();
    this.readServices();
  }

  // Announce the monitor's metadata to the libp2p network via pubsub
  // @Interval(5 * 1000) // every 30 seconds
  @Interval(config.updateInterval)
  async announceMeta() {
    this.logger.debug('announceMeta...');
    // handler in ../workers/workers.service.ts
    this.eventEmitter.emit('announceMeta');
  }

  // @Cron('0 */5 * * * *') // every 5 minutes
  // Trigger message for workers to run jobs
  // @Interval(30 * 1000) // every 30 seconds
  @Interval(config.updateInterval)
  async createJobsForWorkers() {
    // this.logger.debug('[createJobsForWorkers] starting...');
    // handler in ../workers/workers.service.ts
    this.eventEmitter.emit('createJobsForWorkers');
    //this.logger.debug('[runJobsForWorkers] res', res);
  }

  // @Interval(10000) // used for debugging
  @Cron('0 1 * * * *') // every hour, on the 01 of hour
  async readServices() {
    return this.tasks.readServices();
  }

  @Cron('0 0 * * * *') // every hour, on the hour
  async readMembers() {
    return this.tasks.readMembers();
  }

  @Cron('0 0 0 * * *') // every day, at midnight
  async pruneDatabase() {
    return this.tasks.pruneDatabase(config);
  }
}
