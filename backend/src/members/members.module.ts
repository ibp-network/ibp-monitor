import { Module, forwardRef } from '@nestjs/common';

import { Libp2pModule } from '../libp2p/libp2p.module.js';
import { MembersService } from './members.service.js';
import { MembersController } from './members.controller.js';
import { membersProviders } from './members.providers.js';
import { memberServicesProviders } from '../memberServices/memberServices.providers.js';
import { DatabaseModule } from '../database.module.js';

@Module({
  imports: [DatabaseModule, forwardRef(() => Libp2pModule)],
  controllers: [MembersController],
  providers: [MembersService, ...membersProviders, ...memberServicesProviders],
})
export class MembersModule {}
