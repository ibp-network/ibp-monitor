import { Injectable, Inject } from '@nestjs/common';

// import { Member } from '../models/member.js';
// import { Libp2pService } from '../libp2p/libp2p.service.js';
// import { MemberService } from '../models/member-service.js';
// import { MembershipLevel } from '../models/membership-level.js';

import { PrometheusExporter } from './prometheus-exporter.js';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MetricsService {
  private prometheusExporter: PrometheusExporter;

  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {
    this.prometheusExporter = new PrometheusExporter(this.sequelize.models);
  }

  async export (serviceId: string) {
    return this.prometheusExporter.export(serviceId);
  }

}
