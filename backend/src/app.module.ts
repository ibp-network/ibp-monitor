import fs from 'fs';
import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
// import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';
// import { BullModule } from '@nestjs/bull';
// import { RedisModule } from '@liaoliaots/nestjs-redis';
// import { ZMQModule } from './zeromq-microservice';

// import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import config from '../config/config.js';
console.log('config', config);
// read the version from package.json
import configuration from './config/configuration.js';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { Libp2pModule } from './libp2p/libp2p.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { WorkersModule } from './workers/workers.module.js';
import { HomeModule } from './home/home.module.js';
import { GeoDnsModule } from './geodns/geodns.module.js';
import { StatusModule } from './status/status.module.js';
import { MembersModule } from './members/members.module.js';
import { ServicesModule } from './services/services.module.js';
import { MonitorsModule } from './monitors/monitors.module.js';
import { HealthChecksModule } from './healthChecks/healthChecks.module.js';
import { MetricsModule } from './metrics/metrics.module.js';

import path from 'path';
const __dirname = path.resolve();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend/static'), // <-- path to the static files
    }),
    Libp2pModule.forRoot(config.libp2p),
    // ZeromqModule,
    TasksModule,
    WorkersModule,
    HomeModule,
    GeoDnsModule,
    MembersModule,
    ServicesModule,
    MonitorsModule,
    HealthChecksModule,
    StatusModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Libp2pService, // provide this gloablly
  ],
  exports: [AppService],
})
export class AppModule {
  constructor(
    private configService: ConfigService
    ) {}
}
