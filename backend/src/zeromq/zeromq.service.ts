import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  ClientProxy,
  PacketId,
  ReadPacket,
  WritePacket,
} from '@nestjs/microservices';
import zmq from 'zeromq';
import { Libp2pRpcRequest, Libp2pRpcResponse } from './zeromq.interfaces.js';
const frontPort = 'tcp://127.0.0.1:12345';
const backPort = 'tcp://127.0.0.1:12346';

const logger = new Logger('ZeromqService');

@Injectable()
export class ZeromqService extends ClientProxy {
  zmqClient: zmq.Socket;

  constructor() {
    logger.warn('constructor()');
    super();
    this.zmqClient = zmq.socket('req'); // https://zeromq.org/socket-api/#request-reply-pattern
    this.zmqClient.on('error', (err) => {
      logger.error('ZMQ_CLIENT error', err);
    });

    this.zmqClient
      .on('message', async (message) => {
        logger.debug('zmqClient.on:message', message);
        try {
          const packet: WritePacket & PacketId = JSON.parse(message.toString());
          const isHandled = await this.handleZMQResponse(packet);
          logger.debug('isHandled', isHandled);
          // if (!isHandled) {
          //   message.nack();
          // } else if (this.noAck) {
          //   message.ack();
          // }
        } catch (error) {
          logger.error(error);
          // if (this.noAck) {
          //   message.nack();
          // }
        }
      })
      .on('error', (err: any) => logger.error(err));

    this.zmqClient.connect(backPort);
    logger.log(`ZMQ Client connected to port, ${backPort}`);

    this.initializeSerializer({ serializer: undefined });
    this.initializeDeserializer({ deserializer: undefined });
  }

  async connect(): Promise<zmq.Socket> {
    logger.warn('connect()');
    if (this.zmqClient) {
      return this.zmqClient;
    }
    // this.client = this.createClient();
    // this.bindEvents();
  }

  public async close(): Promise<void> {
    logger.warn('close()');
    this.zmqClient.close();
  }

  /**
   * Sync wrapper around publish()
   * <ul>
   * <li>zmq.publish() publishes a message to the topic using the zmq packet message interface</li>
   * <li>response will be handled by the zmqClient.on('message') subscription, and passed back via callback</li>
   * </ul>
   * @param request: Libp2pRpcRequest
   * @param callback: (response: Libp2pRpcResponse) => void
   * @returns Promise\<Libp2pRpcResponse\>
   */
  public rpc(
    request: Libp2pRpcRequest,
    callback: (response: Libp2pRpcResponse) => void,
  ) {
    const { method, params } = request;
    this.publish({ pattern: { command: method }, data: params }, (packet) => {
      const { err, response } = packet;
      if (err) { console.warn('rpc() ERROR'); console.error(err); logger.error(err); }
      callback(response);
    });
  }

  /**
   * Async wrapper around publishAsync()
   * <ul>
   * <li>publishAsync() publishes a message to the topic using the zmq packet message interface</li>
   * <li>response will be handled by the zmqClient.on('message') subscription</li>
   * </ul>
   * @param request: Libp2pRpcRequest
   * @returns Promise\<Libp2pRpcResponse\>
   */
  public async rpcAsync(request: Libp2pRpcRequest): Promise<Libp2pRpcResponse> {
    const { method, params } = request;
    const packet = (await this.publishAsync({
      pattern: { command: method },
      data: params,
    })) as WritePacket;
    logger.debug('rpcAsync() packet', JSON.stringify(packet));
    const { err, response } = packet;
    if (err) { console.warn('rpcAsync() ERROR'); console.error(err); logger.error(err); }
    const rpcResponse = {
      method: response.pattern.command,
      result: response.data,
      error: err || response.err,
    } as Libp2pRpcResponse;
    return rpcResponse;
  }

  /**
   * Publishes a message to the topic, response will be handled by the zmqClient.on('message') subscription
   * @param partialPacket
   * @param callback
   */
  protected publish(
    partialPacket: ReadPacket,
    callback: (packet: WritePacket) => void,
  ) {
    logger.debug('publish', partialPacket);
    try {
      const packet = this.assignPacketId(partialPacket);
      const serializedPacket = this.serializer.serialize(packet);
      logger.debug('about to send serializedPacket', serializedPacket);
      this.routingMap.set(packet.id, callback);
      this.zmqClient.send(JSON.stringify(serializedPacket), null, (err) => {
        if (err) {
          logger.error('zmqClient.send error', err);
        }
        logger.debug('publish sent message', serializedPacket.id);
      });
      logger.debug('publish sent', serializedPacket.id);
      return () => this.routingMap.delete(packet.id);
    } catch (err) {
      logger.error('publish error', err);
      callback({ err });
      return () => false;
    }
  }

  /**
   * Async wrapper around publish()
   */
  protected async publishAsync(
    partialPacket: ReadPacket,
  ): Promise<void | WritePacket> {
    logger.debug('publishAsync', partialPacket);
    return new Promise((resolve, reject) => {
      // logger.debug('publishAsync promise');
      const timeout = setTimeout(() => {
        resolve({ err: 'timeout' });
      }, 5000);
      this.publish(
        partialPacket,
        (
          packet:
            | void
            | WritePacket<any>
            | PromiseLike<void | WritePacket<any>>,
        ) => {
          logger.debug('publishAsync callback', packet);
          clearTimeout(timeout);
          resolve(packet);
        },
      );
    });
  }

  /**
   * A resonse is received from the subscription to the reply topic. We find the callback in the routingMap and call it.
   * @param packet: WritePacket & PacketId
   */
  public async handleZMQResponse(
    packet: WritePacket & PacketId,
  ): Promise<boolean> {
    logger.debug('handleZMQResponse', packet);
    const { err, response } = packet;
    if (err) {
      logger.error('handleZMQResponse protocol error', err);
      return false;
    }
    // const { id, pattern, data, err } = rawMessage;
    const message: Libp2pRpcResponse = response;
    logger.debug('handleZMQResponse message', message);
    const correlationId = packet.id; // || id;
    const callback = this.routingMap.get(correlationId);
    if (!callback) {
      logger.warn('callback not found');
      return false;
    } else {
      callback(packet);
    }
    // if (response.err) {
    //   callback({
    //     err: response.err,
    //     response,
    //     //isDisposed,
    //   });
    // } else {
    //   callback({
    //     err: null,
    //     response,
    //   });
    // }
    return true;
  }

  /**
   * Send a message to the topic, no response expected
   */
  protected async dispatchEvent(packet: ReadPacket): Promise<any> {
    logger.debug('dispatchEvent', packet);
    const pattern = this.normalizePattern(packet.pattern);
    if (this.zmqClient.closed) {
      logger.error('MQPubSub client is not connected');
      return;
    }
    const serializedPacket = this.serializer.serialize({
      ...packet,
      pattern,
    });
    this.zmqClient.send(JSON.stringify(serializedPacket));
  }
}
