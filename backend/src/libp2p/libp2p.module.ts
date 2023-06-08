import {
  Global,
  Module,
  OnApplicationShutdown,
  DynamicModule,
  Logger,
  forwardRef,
} from '@nestjs/common';

import { DatabaseModule } from '../database.module.js';
import { MembersModule } from '../members/members.module.js';
import { monitorsProviders } from '../monitors/monitors.providers.js';
import { membersProviders } from '../members/members.providers.js';

import { ILibp2pOptions } from './libp2p.interfaces.js';
import { Libp2pGateway } from './libp2p.gateway.js';
import { Libp2pService } from './libp2p.service.js';
import { libp2pProviders } from './libp2p.providers.js';

const logger = new Logger('Libp2pModule');

@Global()
@Module({
  imports: [DatabaseModule, forwardRef(() => MembersModule)],
  controllers: [],
  providers: [
    ...monitorsProviders,
    ...membersProviders,
    ...libp2pProviders,
    {
      provide: 'LIBP2P_OPTIONS',
      useValue: {}, // default value TODO setup some defaults?
    },
  ],
  exports: [Libp2pModule, 'LIBP2P_OPTIONS'],
})
export class Libp2pModule implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    console.log('Libp2pModule onApplicationShutdown', signal);
    // await this.libp2pService.stop();
    logger.warn('onApplicationShutdown not implemented');
  }

  static forRoot(options?: ILibp2pOptions): DynamicModule {
    logger.log('Libp2pModule.forRoot', options);
    const providers = [
      ...libp2pProviders,
      Libp2pGateway,
      Libp2pService,
      {
        provide: 'LIBP2P_OPTIONS',
        useValue: options || {},
      },
    ];
    return {
      module: Libp2pModule,
      providers: [...providers, Libp2pService],
      exports: [...providers, Libp2pService],
    };
  }

  // static async forRootAsync(options: Libp2pModuleAsyncOptions): DynamicModule {
  //   const providers = libp2pProviders; //  createLibp2pProviders(options);
  //   return {
  //     module: Libp2pModule,
  //     providers: providers,
  //     exports: providers,
  //   };
  // }
}
