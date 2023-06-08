import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

import axios from 'axios';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import moment from 'moment';

import config from '../../config/config.js';

import { MembersDef, ServicesDef } from './tasks.interfaces.js';

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

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private eventEmitter: EventEmitter2,
  ) {}

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
    this.logger.debug('[readServices] starting...');
    const res = await axios.get(
      'https://raw.githubusercontent.com/ibp-network/config/main/services.json',
    );
    if (res.data) {
      const servicesDef: ServicesDef = res.data || {};
      const domains = Object.keys(servicesDef);
      this.logger.warn('[readServices] NOT IMPLEMENTED');
    } else {
      this.logger.error('[readServices] Failed to read services');
    }
  }

  @Cron('0 0 * * * *') // every hour, on the hour
  async readMembers() {
    this.logger.debug('[readMembers] starting...');
    const res = await axios.get(
      'https://raw.githubusercontent.com/ibp-network/config/main/members.json',
    );
    if (res.data) {
      const membersDef: MembersDef = res.data || {};
      const memberIds = Object.keys(membersDef.members);
      this.logger.debug(
        '[readMembers] Deactivating active members not in the list',
        `[${memberIds.join(', ')}]`,
      );
      await this.sequelize.models.Member.update(
        { status: 'inactive' },
        {
          where: {
            id: { [Op.notIn]: memberIds },
            status: { [Op.ne]: 'inactive' },
          },
        },
      );
      // this.logger.log('done inactivating those not in the list');

      Object.entries(membersDef.members).forEach(async ([memberId, member]) => {
        if (member.active !== '1') return;
        // upsert the member
        let model = await this.sequelize.models.Member.findByPk(memberId);
        if (!model) {
          console.debug(`[readMembers] creating new member: ${memberId}`);
          model = await this.sequelize.models.Member.create({
            id: memberId,
            name: member.name,
            website: member.website,
            logoUrl: member.logo,
            serviceIpAddress: member.services_address,
            membershipType: member.membership,
            membershipLevelId: member.current_level,
            membershipLevelTimestamp:
              member.level_timestamp[member.current_level],
            status: member.active === '1' ? 'active' : 'pending',
            region: member.region,
            latitude: member.latitude,
            longitude: member.longitude,
          });
        } else {
          this.logger.debug(`[readMembers] updating member: ${memberId}`);
          await this.sequelize.models.Member.update(
            {
              name: member.name,
              website: member.website,
              logoUrl: member.logo,
              serviceIpAddress: member.services_address,
              membershipType: member.membership,
              membershipLevelId: member.current_level,
              membershipLevelTimestamp:
                member.level_timestamp[member.current_level],
              status: member.active === '1' ? 'active' : 'pending',
              region: member.region,
              latitude: member.latitude,
              longitude: member.longitude,
            },
            { where: { id: memberId } },
          );
        }
      });
    } else {
      this.logger.error('[readMembers] Failed to read members');
    }
  }

  @Cron('0 0 0 * * *') // every day, at midnight
  async pruneDatabase() {
    this.logger.debug('[pruneDatabase] starting...', config.pruning);
    const marker = moment.utc().add(-config.pruning.age, 'seconds');
    this.logger.debug('[pruneDatabase] marker', marker);
    const result = { monitors: 0, healthChecks: 0, services: 0, members: 0 };

    // Prune healthChecks
    result.healthChecks = await this.sequelize.models.HealthCheck.destroy({
      where: { createdAt: { [Op.lt]: marker.format('YYYY-MM-DD HH:mm:ss') } },
    });
    // result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, errorCount: { [Op.gt]: 10 } } })
    // console.debug('Service.stale: error', result)
    // result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, updatedAt: { [Op.lt]: marker } } })
    // console.debug('Service.stale: updatedAt', result)
    // delete healthChecks for stale services
    // const staleServices = this.Service.findAll({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    // for(var i = 0; i < staleServices.length; i++) {
    //   const svc = staleServices[i]
    //   await this.HealthCheck.destroy({ where: { serviceUrl: svc.serviceUrl } })
    // }
    // result = await this.HealthCheck.destroy({ where: })
    // delete stale services
    // result = await this.Service.destroy({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    // console.debug('Services.prune: stale', result)

    // TODO prune stale services?
    // TODO prune stale monitors?

    // result.monitors = await this.sequelize.models.Monitor.destroy({
    //   where: {
    //     id: { [Op.notIn]: [this.peerId] },
    //     updatedAt: { [Op.lt]: marker.format('YYYY-MM-DD HH:mm:ss') },
    //   },
    // });
    this.logger.debug(`[pruneDatabase] ${JSON.stringify(result)}`);
  }
}
