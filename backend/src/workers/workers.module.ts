import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DatabaseModule } from '../database.module.js';
import { databaseProviders } from '../database.providers.js';
// import { zeromqProviders } from '../zeromq/zeromq.providers.js';
import { ZeromqService } from '../zeromq/zeromq.service.js';
import { Libp2pModule } from '../libp2p/libp2p.module.js';
import { Libp2pService } from '../libp2p/libp2p.service.js';

import { WorkersController } from './workers.controller.js';
import { WorkersService } from './workers.service.js';
import { WorkersGateway } from './workers.gateway.js';
// import { Libp2pModule } from '../libp2p/libp2p.module.js';

@Module({
  imports: [DatabaseModule, Libp2pModule],
  controllers: [WorkersController],
  providers: [
    ...databaseProviders,
    // ...zeromqProviders,
    // Libp2pService,
    ZeromqService,
    WorkersService,
    WorkersGateway,
  ],
  exports: [WorkersService],
})
export class WorkersModule {}
