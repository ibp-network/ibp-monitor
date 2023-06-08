import { ConfigService } from '@nestjs/config';
import { Inject, Controller, Get, Req } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { AppService } from '../app.service.js';
import { CustomEvent } from '../interface/polyfill.js';

import config from '../../config/config.js';

const logger = new Logger('MembersController');

@Controller('home') // <= /api/home
export class HomeController {
  private peerId = 'undefined';

  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    @Inject('SEQUELIZE') private sequelize: Sequelize
  ) {}

  // @MessagePattern('local:peerId')
  // async handlePeerId(peerId: CustomEvent<any>) {
  //   logger.log('handlePeerId', peerId.toString());
  //   this.peerId = peerId.toString();
  // }

  @Get()
  async home(): Promise<any> {
    logger.log('home');
    // return response;
    // const memberCount = await this.membersService.count(); // this.sequelize.models.Member.count();
    // const monitorCount = await this.monitorsService.count(); // this.sequelize.models.Monitor.count();
    // const serviceCount = await this.servicesService.count(); // this.sequelize.models.Service.count();
    // const checkCount = await this.healthChecksService.count();
    const memberCount = await this.sequelize.models.Member.count();
    const monitorCount = await this.sequelize.models.Monitor.count();
    const serviceCount = await this.sequelize.models.Service.count();
    const checkCount = await this.sequelize.models.HealthCheck.count();
    const version = this.configService.get<string>('app.version');
    logger.log('home', { memberCount, monitorCount, serviceCount, checkCount, version });
    return {
      version,
      localMonitorId: this.appService.getPeerId(),
      config: { dateTimeFormat: config.dateTimeFormat },
      memberCount,
      monitorCount,
      serviceCount,
      checkCount,
      // members,
    };
  }
}
