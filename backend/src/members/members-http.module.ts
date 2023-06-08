import { Module } from '@nestjs/common';
import { MembersModule } from './members.module.js';
import { MembersService } from './members.service.js';
import { MembersController } from './members.controller.js';

@Module({
  imports: [MembersModule],
  providers: [MembersService],
  controllers: [MembersController],
})
export class UserHttpModule {}
