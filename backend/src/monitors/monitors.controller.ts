import { Controller, Get, Inject, Req, Logger } from '@nestjs/common';
import { Request } from 'express';

import { MonitorsService } from './monitors.service.js';

const logger = new Logger('MonitorsController');

@Controller('monitor')
export class MonitorsController {
  constructor(
    private readonly monitorsService: MonitorsService,
  ) {}

  @Get()
  async findAll(@Req() request: Request): Promise<any> {
    logger.log('findAll', request.params);
    const peers = await this.monitorsService.getPeers();
    const monitors = await this.monitorsService.findAll();
    return {
      dateTimeFormat: this.monitorsService.getDateTimeFormat(),
      localMonitorId: this.monitorsService.getPeerId(),
      monitors,
      peers,
      version: this.monitorsService.getAppVersion()
    };
  }

  @Get(':monitorId')
  async findOne(@Req() request: Request): Promise<any> {
    logger.debug(`findOne, ${request.params.id}`);
    const { monitorId } = request.params;
    const monitor = await this.monitorsService.findOne(monitorId);
    const healthChecks = await this.monitorsService.getHealthChecks(monitorId);
    return {
      dateTimeFormat: this.monitorsService.getDateTimeFormat(),
      localMonitorId: this.monitorsService.getPeerId(),
      monitor,
      healthChecks,
      version: this.monitorsService.getAppVersion()
    };
  }
}
