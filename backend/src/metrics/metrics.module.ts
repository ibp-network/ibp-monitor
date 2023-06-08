import { Module } from '@nestjs/common';

import { MetricsService } from './metrics.service.js';
import { MetricsController } from './metrics.controller.js';
import { DatabaseModule } from '../database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
