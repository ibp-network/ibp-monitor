import { Controller, Get, Inject, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Logger } from '@nestjs/common';

import { WorkersService } from './workers.service.js';

@Controller('worker')
export class WorkersController {
  private readonly logger = new Logger('WorkersController');

  constructor(
    private readonly workersService: WorkersService,
    // @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
  ) {}

  @Get()
  async findAll(@Req() request: Request): Promise<any> {
    this.logger.debug('findAll', request.params);
    const workers = this.workersService.findAll();
    const result = [];
    workers.forEach((worker) => {
      const { workerId, capabilities } = worker.handshake.query;
      result.push({
        id: worker.id,
        workerId,
        capabilities,
      });
    });
    return result;
  }

  // @Get(':id')
  // async findOne(@Req() request: Request): Promise<HealthCheck> {
  //   this.logger.debug('findOne', request.params);
  //   return this.healthChecksService.findOne(request.params.id);
  // }

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
