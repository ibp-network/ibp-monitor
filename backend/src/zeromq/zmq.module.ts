// import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
// import {
//   createConfigurableDynamicRootModule,
//   IConfigurableDynamicRootModule,
// } from '@golevelup/nestjs-modules';
type IConfigurableDynamicRootModule = any;
import {
  DynamicModule,
  Module,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
// import { AmqpConnection } from './amqp/connection';
// import { AmqpConnectionManager } from './amqp/connectionManager';
import {
  ZMQ_ARGS_METADATA,
  ZMQ_CONFIG_TOKEN,
  ZMQ_HANDLER,
} from './zmq.constants.js';
import { ZMQRpcParamsFactory } from './zmq.factory.js';
import { ZMQHandlerConfig, ZMQPubSubOptions } from './zmq.interfaces.js';

// declare const placeholder: IConfigurableDynamicRootModule<ZMQModule, ZMQConfig>;

@Module({
  // imports: [DiscoveryModule],
})
export class ZMQModule {}
//   extends createConfigurableDynamicRootModule<ZMQModule, ZMQPubSubOptions>(
//     ZMQ_CONFIG_TOKEN,
//     {
//       providers: [
//         {
//           provide: AmqpConnectionManager,
//           useFactory: async (
//             config: ZMQConfig
//           ): Promise<AmqpConnectionManager> => {
//             await ZMQModule.AmqpConnectionFactory(config);
//             return ZMQModule.connectionManager;
//           },
//           inject: [ZMQ_CONFIG_TOKEN],
//         },
//         {
//           provide: AmqpConnection,
//           useFactory: async (
//             config: ZMQConfig,
//             connectionManager: AmqpConnectionManager
//           ): Promise<AmqpConnection> => {
//             return connectionManager.getConnection(
//               config.name || 'default'
//             ) as AmqpConnection;
//           },
//           inject: [ZMQ_CONFIG_TOKEN, AmqpConnectionManager],
//         },
//         ZMQRpcParamsFactory,
//       ],
//       exports: [AmqpConnectionManager, AmqpConnection],
//     },
//   )
//   implements OnApplicationBootstrap, OnApplicationShutdown
// {
//   private readonly logger = new Logger(ZMQModule.name);

//   private static connectionManager = new AmqpConnectionManager();
//   private static bootstrapped = false;

//   constructor(
//     private readonly discover: DiscoveryService,
//     private readonly externalContextCreator: ExternalContextCreator,
//     private readonly rpcParamsFactory: RabbitRpcParamsFactory,
//     private readonly connectionManager: AmqpConnectionManager
//   ) {
//     super();
//   }

//   static async AmqpConnectionFactory(config: ZMQConfig) {
//     const connection = new AmqpConnection(config);
//     this.connectionManager.addConnection(connection);
//     await connection.init();
//     const logger = config.logger || new Logger(ZMQModule.name);
//     logger.log('Successfully connected to ZMQ');
//     return connection;
//   }

//   public static build(config: ZMQConfig): DynamicModule {
//     const logger = config.logger || new Logger(ZMQModule.name);
//     logger.warn(
//       'build() is deprecated. use forRoot() or forRootAsync() to configure ZMQ'
//     );
//     return {
//       module: ZMQModule,
//       providers: [
//         {
//           provide: AmqpConnection,
//           useFactory: async (): Promise<AmqpConnection> => {
//             return ZMQModule.AmqpConnectionFactory(config);
//           },
//         },
//         RabbitRpcParamsFactory,
//       ],
//       exports: [AmqpConnection],
//     };
//   }

//   public static attach(connection: AmqpConnection): DynamicModule {
//     return {
//       module: ZMQModule,
//       providers: [
//         {
//           provide: AmqpConnection,
//           useValue: connection,
//         },
//         RabbitRpcParamsFactory,
//       ],
//       exports: [AmqpConnection],
//     };
//   }

//   async onApplicationShutdown() {
//     this.logger.verbose('Closing AMQP Connections');

//     await Promise.all(
//       this.connectionManager
//         .getConnections()
//         .map((connection) => connection.managedConnection.close())
//     );

//     this.connectionManager.clearConnections();
//     ZMQModule.bootstrapped = false;
//   }

//   // eslint-disable-next-line sonarjs/cognitive-complexity
//   public async onApplicationBootstrap() {
//     if (ZMQModule.bootstrapped) {
//       return;
//     }
//     ZMQModule.bootstrapped = true;

//     for (const connection of this.connectionManager.getConnections()) {
//       if (!connection.configuration.registerHandlers) {
//         this.logger.log(
//           'Skipping ZMQ Handlers due to configuration. This application instance will not receive messages over ZMQ'
//         );

//         continue;
//       }

//       this.logger.log('Initializing ZMQ Handlers');

//       let rabbitMeta =
//         await this.discover.providerMethodsWithMetaAtKey<RabbitHandlerConfig>(
//           ZMQ_HANDLER
//         );

//       if (connection.configuration.enableControllerDiscovery) {
//         this.logger.log(
//           'Searching for ZMQ Handlers in Controllers. You can not use NestJS HTTP-Requests in these controllers!'
//         );
//         rabbitMeta = rabbitMeta.concat(
//           await this.discover.controllerMethodsWithMetaAtKey<RabbitHandlerConfig>(
//             ZMQ_HANDLER
//           )
//         );
//       }

//       const grouped = groupBy(
//         rabbitMeta,
//         (x) => x.discoveredMethod.parentClass.name
//       );

//       const providerKeys = Object.keys(grouped);

//       for (const key of providerKeys) {
//         this.logger.log(`Registering rabbitmq handlers from ${key}`);
//         await Promise.all(
//           grouped[key].map(async ({ discoveredMethod, meta: config }) => {
//             if (
//               config.connection &&
//               config.connection !== connection.configuration.name
//             ) {
//               return;
//             }

//             const handler = this.externalContextCreator.create(
//               discoveredMethod.parentClass.instance,
//               discoveredMethod.handler,
//               discoveredMethod.methodName,
//               ZMQ_ARGS_METADATA,
//               this.rpcParamsFactory,
//               undefined, // contextId
//               undefined, // inquirerId
//               undefined, // options
//               'rmq' // contextType
//             );

//             const mergedConfig = {
//               ...config,
//               ...connection.configuration.handlers[config.name || ''],
//             };
//             const { exchange, routingKey, queue, queueOptions } = mergedConfig;

//             const handlerDisplayName = `${discoveredMethod.parentClass.name}.${
//               discoveredMethod.methodName
//             } {${config.type}} -> ${
//               // eslint-disable-next-line sonarjs/no-nested-template-literals
//               queueOptions?.channel ? `${queueOptions.channel}::` : ''
//             }${exchange}::${routingKey}::${queue || 'amqpgen'}`;

//             if (
//               config.type === 'rpc' &&
//               !connection.configuration.enableDirectReplyTo
//             ) {
//               this.logger.warn(
//                 `Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`
//               );
//               return;
//             }

//             this.logger.log(handlerDisplayName);

//             return config.type === 'rpc'
//               ? connection.createRpc(handler, mergedConfig)
//               : connection.createSubscriber(
//                   handler,
//                   mergedConfig,
//                   discoveredMethod.methodName
//                 );
//           })
//         );
//       }
//     }
//   }
// }
