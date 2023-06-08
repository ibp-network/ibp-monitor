import { Module } from '@nestjs/common';

import { GeoDnsPoolController } from './geoDnsPool.controller.js';

import { Libp2pModule } from '../libp2p/libp2p.module.js';
import { DatabaseModule } from '../database.module.js';
import { databaseProviders } from '../database.providers.js';

@Module({
  imports: [DatabaseModule, Libp2pModule],
  controllers: [GeoDnsPoolController],
  providers: [
    ...databaseProviders,
  ],
})
export class GeoDnsModule {}
