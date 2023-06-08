import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MemberServicesService } from './memberServices.service.js';
import { MemberServicesController } from './memberServices.controller.js';
// import { MemberService } from '../models/member-service.js';
import { DatabaseModule } from '../database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [MemberServicesController],
  providers: [MemberServicesService],
})
export class MembersModule {}
