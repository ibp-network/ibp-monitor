import { Controller, Inject, Get, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';

import { Service } from '../models/service.js';
import { ServicesService } from './services.service.js';

@Controller('service')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    // private readonly configService: ConfigService,
    // @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  @Get()
  async findAll(@Req() request: Request): Promise<any> {
    console.log('findAll', request.params);
    // return [] as Member[];
    const services = await this.servicesService.findAll();
    return {
      dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
      localMonitorId: this.servicesService.getPeerId(),
      version: this.servicesService.getAppVersion(),
      services,
    };
  }

  @Get(':serviceId')
  async findOne(@Req() request: Request): Promise<any> {
    console.log('findOne', request.params);
    const serviceId = request.params.serviceId;
    const service = await this.servicesService.findOne(serviceId);
    if (!service) {
      throw new NotFoundException();
    } else {
      const healthChecks = await this.servicesService.getHealthChecks(serviceId)
      return {
        version: this.servicesService.getAppVersion(),
        localMonitorId: this.servicesService.getPeerId(),
        dateTimeFormat: this.servicesService.getDateTimeFormat(),
        service,
        healthChecks,
      }
    }
  }

  @Get(':serviceId/healthChecks')
  async memberChecks(@Req() request: Request): Promise<any> {
    console.log('serviceChecks', request.params);
    const serviceId = request.params.serviceId;
    const healthChecks = await this.servicesService.getHealthChecks(serviceId)
    return { healthChecks };
  }

  @Get(':serviceId/nodes')
  async memberNodes(@Req() request: Request): Promise<any> {
    console.log('memberChecks', request.params);
    const serviceId = request.params.serviceId;
    const nodes = await this.servicesService.getMemberServiceNodes(serviceId);
    return { nodes };
  }
}
