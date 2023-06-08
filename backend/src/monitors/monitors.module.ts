import { forwardRef, Module } from '@nestjs/common';

import { AppModule } from '../app.module.js';
import { Libp2pModule } from '../libp2p/libp2p.module.js';
import { Libp2pService } from '../libp2p/libp2p.service.js';
import { MonitorsService } from './monitors.service.js';
import { HealthChecksModule } from '../healthChecks/healthChecks.module.js';
// import { HealthChecksService } from '../healthChecks/healthChecks.service.js';
import { healthChecksProviders } from '../healthChecks/healthChecks.providers.js';

import { MonitorsController } from './monitors.controller.js';
import { monitorsProviders } from './monitors.providers.js';
// import { ZeromqService } from '../zeromq/zeromq.service.js';
// import { zeromqProviders } from '../zeromq/zeromq.providers.js';
import { DatabaseModule } from '../database.module.js';
import { AppService } from '../app.service.js';

@Module({
  imports: [
    DatabaseModule,
    Libp2pModule,
    forwardRef(() => AppModule),
    forwardRef(() => HealthChecksModule),
  ],
  controllers: [MonitorsController],
  providers: [
    // AppService,
    MonitorsService,
    // ...monitorsProviders,
    // ...healthChecksProviders,
  ],
})
export class MonitorsModule {}
