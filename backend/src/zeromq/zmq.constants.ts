import { ClientConfig } from './zmq.interfaces.js';

export const ZMQ_PUBSUB_DEFAULT_TOPIC = 'default_topic';
export const ZMQ_PUBSUB_DEFAULT_SUBSCRIPTION = 'default_subscription';
export const ZMQ_PUBSUB_DEFAULT_PUBLISHER_CONFIG = {}; // TODO what is this?
export const ZMQ_PUBSUB_DEFAULT_SUBSCRIBER_CONFIG = {}; // TODO what is this?
export const ZMQ_PUBSUB_DEFAULT_CLIENT_CONFIG: ClientConfig = {
  url: 'tcp://127.0.0.1:3000',
};
export const ZMQ_PUBSUB_DEFAULT_SERVER_CONFIG: ClientConfig = {
  url: 'tcp://127.0.0.1:3000',
};
export const ZMQ_PUBSUB_DEFAULT_NO_ACK = true;
export const ZMQ_PUBSUB_DEFAULT_INIT = true;
export const ZMQ_PUBSUB_DEFAULT_CHECK_EXISTENCE = true;
export const ZMQ_PUBSUB_DEFAULT_USE_ATTRIBUTES = false;
export const ALREADY_EXISTS = 6;

// from RabbitMQ https://github.com/golevelup/nestjs/blob/master/packages/rabbitmq/src/rabbitmq.constants.ts
export const ZMQ_HANDLER = Symbol('ZMQ_HANDLER');
export const ZMQ_CONFIG_TOKEN = Symbol('ZMQ_CONFIG');
export const ZMQ_ARGS_METADATA = 'ZMQ_ARGS_METADATA';
export const ZMQ_PARAM_TYPE = 3;
export const ZMQ_HEADER_TYPE = 4;
export const ZMQ_REQUEST_TYPE = 5;
