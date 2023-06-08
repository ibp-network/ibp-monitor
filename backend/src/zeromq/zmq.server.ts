import { ServerConfig } from './zmq.interfaces.js';
import zmq from 'zeromq';
import {
  CustomTransportStrategy,
  IncomingRequest,
  OutgoingResponse,
  Server,
} from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import {
  ERROR_EVENT,
  MESSAGE_EVENT,
  NO_MESSAGE_HANDLER,
} from '@nestjs/microservices/constants';
import { isString, isUndefined } from '@nestjs/common/utils/shared.utils';
import { ZMQPubSubOptions, Message } from './zmq.interfaces.js';
import {
  ALREADY_EXISTS,
  ZMQ_PUBSUB_DEFAULT_SERVER_CONFIG,
  ZMQ_PUBSUB_DEFAULT_INIT,
  ZMQ_PUBSUB_DEFAULT_NO_ACK,
  ZMQ_PUBSUB_DEFAULT_PUBLISHER_CONFIG,
  ZMQ_PUBSUB_DEFAULT_SUBSCRIBER_CONFIG,
  ZMQ_PUBSUB_DEFAULT_SUBSCRIPTION,
  ZMQ_PUBSUB_DEFAULT_TOPIC,
  ZMQ_PUBSUB_DEFAULT_CHECK_EXISTENCE,
} from './zmq.constants.js';

const sock = zmq.socket('sub');
sock.subscribe('kitty cats');

export class ZMQPubSubServer extends Server implements CustomTransportStrategy {
  protected logger = new Logger(ZMQPubSubServer.name);

  protected readonly serverConfig: ServerConfig;
  protected readonly topicName: string;
  protected readonly publisherConfig: Record<string, any> = {}; // zmq.Socket; // PublishOptions;
  // protected readonly subscriptionName: string;
  protected readonly subscriberConfig: Record<string, any> = {}; // : zmq.Socket; // SubscriberOptions;
  protected readonly noAck: boolean;
  protected readonly replyTopics: Set<string>;
  protected readonly init: boolean;
  protected readonly checkExistence: boolean;

  protected server: zmq.Socket | null = null; // PubSub | null = null;
  // protected subscription: Subscription | null = null;
  protected responder: zmq.Socket | null = null; // Subscriber | null = null;

  constructor(protected readonly options: ZMQPubSubOptions) {
    super();

    this.serverConfig = this.options.server || ZMQ_PUBSUB_DEFAULT_SERVER_CONFIG;

    this.topicName = this.options.topic || ZMQ_PUBSUB_DEFAULT_TOPIC;

    // this.subscriptionName =
    //   this.options.subscription || ZMQ_PUBSUB_DEFAULT_SUBSCRIPTION;

    this.subscriberConfig =
      this.options.subscriber || ZMQ_PUBSUB_DEFAULT_SUBSCRIBER_CONFIG;

    this.publisherConfig =
      this.options.publisher || ZMQ_PUBSUB_DEFAULT_PUBLISHER_CONFIG;

    this.noAck = this.options.noAck ?? ZMQ_PUBSUB_DEFAULT_NO_ACK;
    this.init = this.options.init ?? ZMQ_PUBSUB_DEFAULT_INIT;
    this.checkExistence =
      this.options.checkExistence ?? ZMQ_PUBSUB_DEFAULT_CHECK_EXISTENCE;

    this.replyTopics = new Set();

    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  public async listen(callback: () => void) {
    this.server = this.createserver();
    this.server.subscribe(this.topicName);
    this.responder = zmq.socket('pub');
    // const topic = this.server.topic(this.topicName);

    // if (this.init) {
    //   await this.createIfNotExists(topic.create.bind(topic));
    // } else if (this.checkExistence) {
    //   const [exists] = await topic.exists();
    //   if (!exists) {
    //     const message = `PubSub server is not started: topic ${this.topicName} does not exist`;
    //     this.logger.error(message);
    //     throw new Error(message);
    //   }
    // }

    // this.subscription = topic.subscription(
    //   this.subscriptionName,
    //   this.subscriberConfig,
    // );

    // if (this.init) {
    //   await this.createIfNotExists(
    //     this.subscription.create.bind(this.subscription),
    //   );
    // } else if (this.checkExistence) {
    //   const [exists] = await this.subscription.exists();
    //   if (!exists) {
    //     const message = `PubSub server is not started: subscription ${this.subscriptionName} does not exist`;
    //     this.logger.error(message);
    //     throw new Error(message);
    //   }
    // }

    // this.subscription
    //   .on(MESSAGE_EVENT, async (message: Message) => {
    //     await this.handleMessage(message);
    //     if (this.noAck) {
    //       message.ack();
    //     }
    //   })
    //   .on(ERROR_EVENT, (err: any) => this.logger.error(err));
    this.server.on(MESSAGE_EVENT, (topic: string, messageBuf: Buffer) => {
      const message: Message = JSON.parse(messageBuf.toString());
      this.logger.log(
        'on:message: received a message related to:',
        topic.toString(),
        'containing message:',
        message.toString(),
      );
      this.handleMessage(message);
    });

    callback();
  }

  public async close() {
    this.server.off(MESSAGE_EVENT, (args) => {
      this.logger.log(`off:${MESSAGE_EVENT}`, args);
    });
    // await closeSubscription(this.subscription);
    // await Promise.all(
    //   Array.from(this.replyTopics.values()).map((replyTopic) => {
    //     return flushTopic(this.server.topic(replyTopic));
    //   }),
    // );
    this.replyTopics.clear();
    // await closePubSub(this.server);
  }

  public async handleMessage(message: Message) {
    const { data, attributes } = message;
    const rawMessage = JSON.parse(data.toString());

    let packet;
    if (attributes.pattern) {
      packet = this.deserializer.deserialize({
        data: rawMessage,
        id: attributes.id,
        pattern: attributes.pattern,
      }) as IncomingRequest;
    } else {
      packet = this.deserializer.deserialize(rawMessage) as IncomingRequest;
    }

    const pattern = isString(packet.pattern)
      ? packet.pattern
      : JSON.stringify(packet.pattern);
    const correlationId = packet.id;

    const context = null; // new ZMQPubSubContext([message, pattern]);

    if (isUndefined(correlationId)) {
      return this.handleEvent(pattern, packet, context);
    }

    const handler = this.getHandlerByPattern(pattern);

    if (!handler) {
      if (!attributes.replyTo) {
        return;
      }

      const status = 'error';
      const noHandlerPacket = {
        id: correlationId,
        status,
        err: NO_MESSAGE_HANDLER,
      };
      return this.sendMessage(
        noHandlerPacket,
        attributes.replyTo,
        correlationId,
      );
    }

    const response$ = this.transformToObservable(
      await handler(packet.data, context),
    ); // as Observable<any>;

    const publish = <T>(data: T) =>
      this.sendMessage(data, attributes.replyTo, correlationId);

    response$ && this.send(response$, publish);
  }

  public async sendMessage<T = any>(
    message: T,
    replyTo: string,
    id: string,
  ): Promise<void> {
    Object.assign(message, { id });

    const outgoingResponse = this.serializer.serialize(
      message as unknown as OutgoingResponse,
    );

    this.replyTopics.add(replyTo);

    // await this.server.
    //   .topic(replyTo, this.publisherConfig)
    //   .publishMessage({ json: outgoingResponse, attributes: { id } });
    this.responder.send([replyTo, JSON.stringify(outgoingResponse)]);
  }

  // public async createIfNotExists(create: () => Promise<any>) {
  //   try {
  //     await create();
  //   } catch (error: any) {
  //     if (error.code !== ALREADY_EXISTS) {
  //       throw error;
  //     }
  //   }
  // }

  public createserver() {
    // return new PubSub(this.serverConfig);
    const server = zmq.socket('sub');
    server.connect(this.serverConfig.url);
    return server;
  }
}
