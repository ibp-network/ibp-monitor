// import { Message } from '@google-cloud/pubsub';
// Example from RedisContext https://docs.nestjs.com/microservices/redis#client
type Message = any;
import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';

type ZMQPubSubContextArgs = [Message, string];

export class ZMQPubSubContext extends BaseRpcContext<ZMQPubSubContextArgs> {
  constructor(args: ZMQPubSubContextArgs) {
    super(args);
  }

  /**
   * Returns the original message (with properties, fields, and content).
   */
  getMessage() {
    return this.args[0];
  }

  /**
   * Returns the name of the pattern.
   */
  getPattern() {
    return this.args[1];
  }
}
