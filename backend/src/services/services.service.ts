import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize, Model } from 'sequelize-typescript';
import { PeerId } from '@libp2p/interface-peer-id';

import { Libp2pService } from '../libp2p/libp2p.service.js';
import { Member } from '../models/member.js';
import { Service } from '../models/service.js';
import { HealthChecksService } from '../healthChecks/healthChecks.service.js';

@Injectable()
export class ServicesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly healthChecksService: HealthChecksService,
    private readonly libp2pService: Libp2pService,
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  getAppVersion = (): string => this.configService.get<string>('app.version');
  getDateTimeFormat = (): string => this.configService.get<string>('app.dateTimeFormat');
  getPeerId = (): PeerId => this.libp2pService.getPeerId();

  async findAll(): Promise<Service[]> {
    return (await this.sequelize.models.Service.findAll({ where: { type: 'rpc' },
      order: [['id', 'ASC']],
      include: ['membershipLevel', 'chain'],
    })) as Service[];
  }

  async findOne(serviceId: string): Promise<Service | null> {
    // return this.servicesRepository.findOneBy({ id });
    return (await this.sequelize.models.Service.findByPk(serviceId, { include: ['membershipLevel', 'chain'] })) as Service;
  }

  async getHealthChecks(serviceId: string): Promise<any> {
    // return await this.healthChecksService.findAll({ where: { serviceId }, order: [['createdAt', 'DESC']], limit: 50 });
    return await this.sequelize.models.HealthCheck.findAll({ where: { serviceId }, order: [['createdAt', 'DESC']], limit: 150 });
  }

  async getMemberServiceNodes(serviceId: string): Promise<any[]> {
    return await this.sequelize.models.MemberServiceNode.findAll({ where: { serviceId } });
  }

  async count(): Promise<number> {
    return this.sequelize.models.Service.count();
  }

  // async remove(id: string): Promise<void> {
  //   // await this.servicesRepository.delete(id);
  //   await this.servicesRepository.destroy({ where: { id } });
  // }
}
