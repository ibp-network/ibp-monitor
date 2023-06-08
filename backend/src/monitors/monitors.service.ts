import { Injectable, Inject } from '@nestjs/common';
import { PeerId } from '@libp2p/interface-peer-id';

import { ConfigService } from '@nestjs/config';
import { Libp2pService } from '../libp2p/libp2p.service.js';
import { HealthChecksService } from '../healthChecks/healthChecks.service.js';
import { Monitor } from '../models/monitor.js';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MonitorsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly libp2pService: Libp2pService,
    private readonly healthChecksService: HealthChecksService,
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  getAppVersion = (): string => this.configService.get<string>('app.version');
  getDateTimeFormat = (): string => this.configService.get<string>('app.dateTimeFormat');
  getPeerId = (): PeerId => this.libp2pService.getPeerId();

  async getPeers(): Promise<PeerId[]> {
    return await this.libp2pService.getPeers();
  }

  async findAll(): Promise<Monitor[]> {
    return (await this.sequelize.models.Monitor.findAll()) as Monitor[];
  }

  async findOne(id: string): Promise<Monitor | null> {
    return (await this.sequelize.models.Monitor.findByPk(id)) as Monitor;
  }

  async getHealthChecks(monitorId: string): Promise<any> {
    // return await this.healthChecksService.findAll({ where: { monitorId }, order: [['createdAt', 'DESC']], limit: 50 });
    return await this.sequelize.models.HealthCheck.findAll({ where: { monitorId }, order: [['createdAt', 'DESC']], limit: 50 });
  }

  async count(): Promise<number> {
    return await this.sequelize.models.Monitor.count();
  }

  // async remove(id: string): Promise<void> {
  //   await this.monitorsRepository.destroy({ where: { id } });
  // }
}
