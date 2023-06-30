import { Sequelize } from 'sequelize-typescript';
import { Provider } from '@nestjs/common';

import { Chain } from './models/chain.js';
import { GeoDnsPool } from './models/geo-dns-pool.js';
import { HealthCheck } from './models/health-check.js';
// import { Log } from './models/log.js';
import { Member } from './models/member.js';
import { MemberService } from './models/member-service.js';
import { MemberServiceNode } from './models/member-service-node.js';
import { MembershipLevel } from './models/membership-level.js';
import { Monitor } from './models/monitor.js';
import { Service } from './models/service.js';

import configuration from '../config/config.js';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mariadb',
        // dialect: configuration.sequelize.options.dialect,
        // host: 'localhost',
        host: configuration.sequelize.options.host,
        // port: 3306,
        port: configuration.sequelize.options.port,
        // username: 'ibp_monitor',
        username: configuration.sequelize.username,
        // password: 'ibp_monitor',
        password: configuration.sequelize.password,
        // database: 'ibp_monitor',
        database: configuration.sequelize.database,
        logging: configuration.sequelize.options.logging,
      });
      sequelize.addModels([
        Chain,
        GeoDnsPool,
        HealthCheck,
        // Log,
        Member,
        MemberService,
        MemberServiceNode,
        MembershipLevel,
        Monitor,
        Service,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  } as Provider,
];
