import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { AppModule } from '../app.module.js';
import { HealthChecksModule } from '../healthChecks/healthChecks.module.js';
import { ServicesController } from './services.controller.js';
import { ServicesService } from './services.service.js';
// import { servicesProviders } from './services.providers.js';
// import { membersProviders } from '../members/members.providers.js';
import { DatabaseModule } from '../database.module.js';
import { databaseProviders } from '../database.providers.js';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AppModule),
    forwardRef(() => HealthChecksModule),
  ],
  controllers: [ServicesController],
  providers: [
    ...databaseProviders,
    ServicesService,
    // ...servicesProviders,
    // ...membersProviders
  ],
})
export class ServicesModule {}
