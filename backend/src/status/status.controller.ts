import { Inject, Controller, Get } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

import { HealthCheck } from 'src/models/health-check';

const logger = new Logger('StatusController');

@Controller('status')
export class StatusController {
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  @Get()
  async home(): Promise<any> {
    logger.log('home');
    const members = await this.sequelize.models.Member.findAll();
    const services = await this.sequelize.models.Service.findAll({
      where: { type: 'rpc' },
      include: ['chain'],
    });
    const status = {};

    const startDate = new Date(new Date().getTime() - 47 * 60 * 60 * 1000);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const healthChecks = (await this.sequelize.models.HealthCheck.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      order: [['createdAt', 'ASC']],
    })) as HealthCheck[];
    for (const healthCheck of healthChecks) {
      const hour = healthCheck.createdAt;
      hour.setMinutes(0);
      hour.setSeconds(0);
      hour.setMilliseconds(0);
      const hourTimestamp = hour.getTime();
      const serviceStatus = status[healthCheck.serviceId];
      if (serviceStatus) {
        const hourStatus = serviceStatus[hourTimestamp];
        if (hourStatus) {
          const memberStatus = hourStatus[healthCheck.memberId];
          if (!memberStatus) {
            status[healthCheck.serviceId][hourTimestamp][healthCheck.memberId] =
              {
                success: 0,
                warning: 0,
                error: 0,
              };
          }
        } else {
          status[healthCheck.serviceId][hourTimestamp] = {};
          status[healthCheck.serviceId][hourTimestamp][healthCheck.memberId] = {
            success: 0,
            warning: 0,
            error: 0,
          };
        }
      } else {
        status[healthCheck.serviceId] = {};
        status[healthCheck.serviceId][hourTimestamp] = {};
        status[healthCheck.serviceId][hourTimestamp][healthCheck.memberId] = {
          success: 0,
          warning: 0,
          error: 0,
        };
      }
      const value =
        status[healthCheck.serviceId][hourTimestamp][healthCheck.memberId];
      switch (healthCheck.status) {
        case 'success':
          value.success = value.success + 1;
          break;
        case 'warning':
          value.warning = value.warning + 1;
          break;
        case 'error':
          value.error = value.error + 1;
          break;
      }
      const successPercent =
        (value.success * 100) / (value.success + value.warning + value.error);
      if (successPercent >= 90) {
        value.status = 'success';
      } else if (successPercent >= 75) {
        value.status = 'warning';
      } else {
        value.status = 'error';
      }
      status[healthCheck.serviceId][hourTimestamp][healthCheck.memberId] =
        value;
    }
    return {
      members,
      services,
      status,
    };
  }
}
