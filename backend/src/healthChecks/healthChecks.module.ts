import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bull';
// import { EventEmitter2 } from '@nestjs/event-emitter';

import { HealthChecksService } from './healthChecks.service.js';
import { HealthChecksController } from './healthChecks.controller.js';
import { healthChecksProviders } from './healthChecks.providers.js';
import { DatabaseModule } from '../database.module.js';

@Module({
  imports: [
    DatabaseModule,
    // BullModule.registerQueue(
    //   { name: 'checkService' },
    //   { name: 'checkBootNode' },
    // ),
  ],
  controllers: [HealthChecksController],
  providers: [
    // EventEmitter2,
    HealthChecksService,
    ...healthChecksProviders,
  ],
  exports: [
    HealthChecksService,
  ],
})
export class HealthChecksModule {}
