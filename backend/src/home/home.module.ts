import { forwardRef } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { HomeController } from './home.controller.js';

import { AppModule } from '../app.module.js';
import { AppService } from '../app.service.js';
import { MonitorsModule } from '../monitors/monitors.module.js';
import { MembersModule } from '../members/members.module.js';
import { monitorsProviders } from '../monitors/monitors.providers.js';
import { membersProviders } from '../members/members.providers.js';
import { healthChecksProviders } from '../healthChecks/healthChecks.providers.js';

import { DatabaseModule } from '../database.module.js';
import { databaseProviders } from '../database.providers.js';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AppModule),
    MembersModule,
    MonitorsModule
  ],
  controllers: [HomeController],
  providers: [
    // AppService,
    ...monitorsProviders,
    ...membersProviders,
    ...healthChecksProviders,
    ...databaseProviders,
  ],
})
export class HomeModule {}
