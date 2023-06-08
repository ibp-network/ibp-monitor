import { Module } from '@nestjs/common';

import { StatusController } from './status.controller.js';

// import { MonitorsModule } from '../monitors/monitors.module.js';
// import { MembersModule } from '../members/members.module.js';
// import { monitorsProviders } from '../monitors/monitors.providers.js';
// import { membersProviders } from '../members/members.providers.js';
// import { healthChecksProviders } from '../healthChecks/healthChecks.providers.js';

import { DatabaseModule } from '../database.module.js';
import { databaseProviders } from '../database.providers.js';

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
  providers: [
    // ...monitorsProviders,
    // ...membersProviders,
    // ...healthChecksProviders,
    ...databaseProviders,
  ],
})
export class StatusModule {}
