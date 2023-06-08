import { ModuleRef } from '@nestjs/core';
import { Inject, Controller, Get, Req, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Request } from 'express';
import { Libp2pService } from '../libp2p/libp2p.service.js';

const logger = new Logger('GeoDnsPoolController');

@Controller('geoDnsPool') // <= /api/geodnsPool
export class GeoDnsPoolController {
  private libp2pService: Libp2pService;

  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    logger.debug('onModuleInit');
    // libp2pGateway is injected lazily to avoid circular dependency
    // this.libp2pService = this.moduleRef.get<Libp2pService>(Libp2pService);
  }

  @Get()
  async findAll(@Req() request: Request): Promise<any> {
    logger.log('findAll', request.params);
    let geoDnsPools = await this.sequelize.models.GeoDnsPool.findAll()
    return {
      version: '0.2.0',
      localMonitorId: this.libp2pService?.getPeerId() || 'unknown',
      dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
      geoDnsPools,
    }
  }
}
