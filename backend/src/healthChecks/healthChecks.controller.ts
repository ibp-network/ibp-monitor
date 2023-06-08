import { Controller, Get, Inject, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { HealthCheck } from '../models/health-check.js';
import { HealthChecksService } from './healthChecks.service.js';

@Controller('healthCheck')
export class HealthChecksController {
  private readonly logger = new Logger('HealthChecksController');

  constructor(
    private readonly healthChecksService: HealthChecksService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {}

  @Get()
  async findAll(@Req() request: Request): Promise<any> {
    this.logger.debug('findAll', request.params);
    const offset = request.query.offset
      ? parseInt(request.query.offset.toString())
      : 0;
    const limit = request.query.limit
      ? parseInt(request.query.limit.toString())
      : 10;
    return await this.healthChecksService.findAll({ offset, limit });
  }

  @Get(':id')
  async findOne(@Req() request: Request): Promise<HealthCheck> {
    this.logger.debug('findOne', request.params);
    return this.healthChecksService.findOne(request.params.id);
  }

  // NOT HERE: use the WorkersGateway instead
  // @Post()
  // async create(@Req() request: Request): Promise<any> {
  //   this.logger.debug('create', request.body);
  //   const {
  //     worker: { id, signature },
  //     model,
  //   } = request.body;
  //   this.logger.debug('create', id, signature, model);
  //   // const created = (await this.sequelize.models.HealthCheck.create(
  //   //   model,
  //   // )) as HealthCheck;
  //   return; // created;
  // }
}
