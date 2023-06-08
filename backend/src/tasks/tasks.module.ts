import { Module } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';

import { DatabaseModule } from '../database.module.js';
import { databaseProviders } from '../database.providers.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [DatabaseModule],
  // controllers: [HomeController],
  providers: [...databaseProviders, TasksService],
})
export class TasksModule {}
