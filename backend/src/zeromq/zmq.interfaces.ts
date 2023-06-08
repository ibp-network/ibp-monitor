import { Deserializer, Serializer } from '@nestjs/microservices';

// import { PublishOptions } from '@google-cloud/pubsub/build/src/publisher';
// import { SubscriberOptions } from '@google-cloud/pubsub/build/src/subscriber';

export interface ClientConfig {
  // extends gax.GrpcClientOptions {
  url?: string;
  port?: string | number;
  host?: string;
  // apiEndpoint?: string;
  // servicePath?: string;
}

export interface ServerConfig {
  url?: string;
  port?: string | number;
  host?: string;
}

export interface Message {
  data: Buffer;
  attributes?: MessageAttributes;
}

export interface MessageAttributes {
  id: number;
  json?: string;
  pattern?: any;
  replyTo?: string;
}

export interface ZMQPubSubOptions {
  client?: ClientConfig;
  server?: ServerConfig;
  topic?: string;
  replyTopic?: string;
  subscription?: string;
  replySubscription?: string;
  noAck?: boolean;
  init?: boolean;
  useAttributes?: boolean;
  checkExistence?: boolean;
  /**
   * from GC PubSub
   */
  publisher?: Record<string, any>; // PublishOptions;
  /**
   * from GC PubSub
   */
  subscriber?: Record<string, any>; // SubscriberOptions;
  serializer?: Serializer;
  deserializer?: Deserializer;
}

// export { ClientConfig };

export type ZMQHandlerType = 'pub' | 'sub'; //  | 'req' | 'res'??
export interface ZMQHandlerConfig {
  type: ZMQHandlerType;
}
