import { Module } from '@nestjs/common';

import { ZeromqService } from './zeromq.service.js';
import { zeromqProviders } from './zeromq.providers.js';
// import { MonitorsController } from './monitors.controller.js';
// import { monitorsProviders } from './monitors.providers.js';
// import { DatabaseModule } from '../database.module.js';

@Module({
  // imports: [DatabaseModule],
  // controllers: [MonitorsController],
  providers: [ZeromqService, ...zeromqProviders],
})
export class ZeromqModule {}
