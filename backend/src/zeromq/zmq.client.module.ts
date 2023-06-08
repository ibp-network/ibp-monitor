import { DynamicModule, Logger } from '@nestjs/common';
import {
  ClientsModule,
  ClientsModuleOptions,
  ClientsModuleAsyncOptions,
  Transport,
} from '@nestjs/microservices';

const logger = new Logger('ZMQClientModule');

// export type ZMQClientsModuleOptions<ClientsModuleOptions> = {
//   isGlobal?: boolean;
// };

// export type ZMQTranport<Transport> = {

// }

export class ZMQClientModule extends ClientsModule {
  transport: Transport;
  static register(options: ClientsModuleOptions): DynamicModule {
    logger.log('ZMQClientModule.register()', options);
    return {
      module: ZMQClientModule,
      imports: [],
      providers: [],
      exports: [],
    };
  }
  // static registerAsync(options: ClientsModuleAsyncOptions): DynamicModule {
  //   console.log('ZMQClientModule.registerAsync()', options);
  //   return {
  //     module: ZMQClientModule,
  //     providers: [],
  //     exports: [],
  //   };
  // }
  // private static createAsyncProviders;
  // private static createAsyncOptionsProvider;
  // private static createFactoryWrapper;
  // private static assignOnAppShutdownHook;
}
