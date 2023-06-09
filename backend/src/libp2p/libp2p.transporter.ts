// import { MessageHandler }
import { Injectable, Logger } from '@nestjs/common';
import {
  CustomTransportStrategy,
  Server,
  Transport,
  MessagePattern,
  EventPattern,
  MessageHandler,
  Payload,
  Ctx,
  PacketId,
  ReadPacket,
  WritePacket,
} from '@nestjs/microservices';
import { EventEmitter2 } from '@nestjs/event-emitter';
import fs from 'fs';
import { Libp2p, createLibp2p } from 'libp2p';
import { bootstrap } from '@libp2p/bootstrap';
import { mdns } from '@libp2p/mdns';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { kadDHT } from '@libp2p/kad-dht';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery';
import { createEd25519PeerId, createFromJSON } from '@libp2p/peer-id-factory';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { isIPv4, isIPv6 } from 'is-ip';
import isValidHostname from 'is-valid-hostname';
import zmq from 'zeromq';
import { PublishResult } from '@libp2p/interface-pubsub';

import { ILibp2pOptions } from './libp2p.interfaces.js';
import { Libp2pRpcRequest, Libp2pRpcResponse } from './libp2p.interfaces';

const frontPort = 'tcp://127.0.0.1:12345';
const backPort = 'tcp://127.0.0.1:12346';

const logger = new Logger('Libp2p:Libp2pServer');

/**
 * @deprecated not used, see libp2p.gateway.ts
 */
export class Libp2pServer extends Server implements CustomTransportStrategy {
  transportId?: symbol | Transport;
  public libp2p: Libp2p;
  private readonly options: ILibp2pOptions;
  private peerId: any;
  private started: boolean;
  private eventEmitter: EventEmitter2;
  protected zmqServer: zmq.Socket;

  // Server()
  // protected readonly messageHandlers: Map<string, MessageHandler<any, any, any>>;
  // protected readonly logger: LoggerService;
  // protected serializer: ConsumerSerializer;
  // protected deserializer: ConsumerDeserializer;
  // addHandler(pattern: any, callback: MessageHandler, isEventHandler?: boolean, extras?: Record<string, any>): void;
  // public getHandlers(): Map<string, MessageHandler> {
  //   return this.messageHandlers;
  // }
  // getHandlerByPattern(pattern: string): MessageHandler | null;
  // send(stream$: Observable<any>, respond: (data: WritePacket) => unknown | Promise<unknown>): Subscription;
  // handleEvent(pattern: string, packet: ReadPacket, context: BaseRpcContext): Promise<any>;
  // transformToObservable<T>(resultOrDeferred: Observable<T> | Promise<T>): Observable<T>;
  // transformToObservable<T>(resultOrDeferred: T): never extends Observable<ObservedValueOf<T>> ? Observable<T> : Observable<ObservedValueOf<T>>;
  // getOptionsProp<T extends MicroserviceOptions['options'], K extends keyof T>(obj: T, prop: K, defaultValue?: T[K]): T[K];
  // protected handleError(error: string): void;
  // protected loadPackage<T = any>(name: string, ctx: string, loader?: Function): T;
  // protected initializeSerializer(options: ClientOptions['options']): void;
  // protected initializeDeserializer(options: ClientOptions['options']): void;
  // protected getRouteFromPattern(pattern: string): string;
  // protected normalizePattern(pattern: MsPattern): string;

  constructor(options: ILibp2pOptions) {
    super();
    logger.debug('constructor(): Constructing Libp2pServer');
    this.options = options;
    this.eventEmitter = new EventEmitter2();
  }

  /**
   * This method is triggered when you run "app.listen()".
   */
  async listen(callback: () => void) {
    logger.debug(`listen(): Listening on port ${this.options.tcpPort}`);
    if (this.started) {
      logger.warn('listen(): Already started');
      callback();
    }
    /*
     * SETUP for ZMQ ==========================================================
     */
    this.zmqServer = zmq.socket('rep'); // https://zeromq.org/socket-api/#request-reply-pattern
    this.zmqServer.on('error', (err) => this.logZMQEvent(err));
    this.zmqServer.on('connection', (stream) => {
      logger.debug('ZMQ Server connected');
    });
    this.zmqServer.on('message', async (data) => {
      logger.debug('ZMQ Server received message', data);
      const inPacket: ReadPacket<any> & PacketId = JSON.parse(data.toString());
      //const message: Libp2pRpcRequest = inPacket.data; // JSON.parse(data.toString());
      // const envelope = JSON.parse(data.toString());
      // logger.debug('Received a message related to:', envelope.toString('utf8'));
      const response = await this.handleZMQMessage(inPacket);
      // logger.debug('response', response);
      this.zmqServer.send(JSON.stringify(response));
    });
    this.zmqServer.bind(backPort);
    logger.debug(`ZMQ Server bound to ${backPort}`);

    /*
     * read or create the peerId ===============================================
     */
    if (fs.existsSync('./keys/peer-id.json')) {
      logger.debug('Found existing peer-id.json');
      const pidJson = JSON.parse(
        fs.readFileSync('./keys/peer-id.json', 'utf-8'),
      );
      // console.debug(pidJson)
      this.peerId = await createFromJSON(pidJson);
    } else {
      logger.debug('Creating new peer-id.json');
      this.peerId = await createEd25519PeerId();
      fs.writeFileSync(
        './keys/peer-id.json',
        JSON.stringify({
          id: this.peerId.toString(),
          privKey: uint8ArrayToString(this.peerId.privateKey, 'base64'),
          pubKey: uint8ArrayToString(this.peerId.publicKey, 'base64'),
        }),
        'utf-8',
      );
    }
    // console.debug('Our monitorId', this.peerId.toString());
    logger.debug('Our monitorID:', this.peerId.toString());

    /*
     * handlers for this event are defined in ./libp2p.controller.ts ============
     */
    const handlers = this.getHandlers();
    const handler = handlers.get('local:peerId');
    if (handler) {
      handler(this.peerId);
    }
    this.zmqServer.send(JSON.stringify({ type: 'peerId', data: this.peerId }));

    const announce = [];
    // check if P2P public IP environment variable is set and not empty
    if (process.env.P2P_PUBLIC_IP && process.env.P2P_PUBLIC_IP.length > 0) {
      if (isIPv4(process.env.P2P_PUBLIC_IP)) {
        const multiaddress = `/ip4/${process.env.P2P_PUBLIC_IP}/tcp/${
          process.env.P2P_PUBLIC_PORT || this.options.tcpPort
        }/p2p/${this.peerId.toString()}`;
        logger.debug(`Announcing P2P IPv4 multiaddress: ${multiaddress}`);
        announce.push(multiaddress);
      } else if (isIPv6(process.env.P2P_PUBLIC_IP)) {
        const multiaddress = `/ip6/${process.env.P2P_PUBLIC_IP}/tcp/${
          process.env.P2P_PUBLIC_PORT || this.options.tcpPort
        }/p2p/${this.peerId.toString()}`;
        logger.debug(`Announcing P2P IPv6 multiaddress: ${multiaddress}`);
        announce.push(multiaddress);
      } else {
        logger.error(
          `Invalid P2P_PUBLIC_IP environment variable: ${process.env.P2P_PUBLIC_IP}. P2P IP address will NOT be announced.`,
        );
      }
    }
    // check if P2P public host environment variable is set and not empty
    if (process.env.P2P_PUBLIC_HOST && process.env.P2P_PUBLIC_HOST.length > 0) {
      if (isValidHostname(process.env.P2P_PUBLIC_HOST)) {
        const multiaddress = `/dnsaddr/${process.env.P2P_PUBLIC_HOST}/tcp/${
          this.options.tcpPort
        }/p2p/${this.peerId.toString()}`;
        logger.debug(`Announcing P2P DNS multiaddress: ${multiaddress}`);
        announce.push(multiaddress);
      } else {
        console.error(
          `Invalid P2P_PUBLIC_HOST environment variable: ${process.env.P2P_PUBLIC_HOST}. P2P DNS address will NOT be announced.`,
        );
      }
    }

    /*
     * create the gossipsub ===================================================
     */
    const gsub = gossipsub({
      enabled: true,
      emitSelf: false, // don't want our own pubsub messages
      // gossipIncoming: true,
      fallbackToFloodsub: true,
      floodPublish: true,
      doPX: true,
      allowPublishToZeroPeers: true,
      // signMessages: true, // TODO: how can we test this?
      // strictSigning: true,
      // messageCache: false,
      // scoreParams: {},
      // directPeers: [],
      // allowedTopics: [ '/fruit' ]
      allowedTopics: this.options.allowedTopics,
    });

    const libp2p = await createLibp2p({
      peerId: this.peerId,
      addresses: {
        listen: [`/ip4/0.0.0.0/tcp/${this.options.tcpPort}`],
        announce,
      },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()],
      // https://github.com/libp2p/js-libp2p/blob/0d62557f9c722f10167fb4d362b402d8657bc816/src/connection-manager/index.ts#L31
      connectionManager: {
        // autoDial: true, // @deprecated
        autoDialInterval: 1000, // in ms
        minConnections: 3, // does this force a reconnect?
        maxConnections: 10,
      },
      peerDiscovery: [
        // mdns({
        //   interval: 20e3,
        // }),
        bootstrap({
          // enabled: true, // @deprecated
          list: this.options.bootstrapPeers,
          timeout: 3 * 1000, // in ms,
          // I don't think we need this - DC
          // tagName: 'bootstrap',
          // tagValue: 50,
          // tagTTL: 120 * 1000, // in ms
        }),
        pubsubPeerDiscovery({
          interval: 10 * 1000, // in ms?
          // topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
          topics: [
            `ibp_monitor._peer-discovery._p2p._pubsub`, // 'ibp_monitor/peer-discovery/p2p/pubsub'??
            '_peer-discovery._p2p._pubsub',
          ],
          listenOnly: false,
        }),
        // star.discovery
      ],
      // relay: this.options.relay, // @deprecated
      dht: kadDHT(),
      pubsub: gsub,
    });

    logger.debug('libp2p starting');
    await libp2p.start();
    this.started = true;
    logger.debug('libp2p started', libp2p.getMultiaddrs());

    // // update our monitor record with computed multiAddrs
    // await ds.Monitor.upsert({
    //   id: this.peerId.toString(),
    //   name: 'local',
    //   multiaddress: libp2p.getMultiaddrs(),
    // });

    /*
     * Handle peer connections =================================================
     */
    libp2p.addEventListener('peer:connect', (connection) => {
      // console.debug('peer:connect', peerId.detail?.toString());
      logger.debug(
        `'peer:connect' ${connection.detail.remotePeer?.toString()}`,
      );
      // logger.debug(peerId.detail);
      const handler = handlers.get('peer:connect');
      if (handler) {
        handler(connection);
      }
    });
    libp2p.addEventListener('peer:disconnect', (connection) => {
      // console.debug('peer:disconnect', peerId.detail?.toString());
      logger.debug(
        `'peer:disconnect' ${connection.detail.remotePeer.toString()}`,
      );
      // console.log(peerId.detail);
      const handler = handlers.get('peer:disconnect');
      if (handler) {
        handler(connection);
      }
    });

    /*
     * Handle peer discovery ===================================================
     */
    libp2p.addEventListener('peer:discovery', async (peerId) => {
      // console.debug(`peer:discovery, we have ${libp2p.getPeers().length} peers`,);
      logger.debug(
        `'peer:discovery' we have ${libp2p.getPeers().length} peers`,
      );
      // console.log(peerId.detail.id);
      logger.debug(`'peer:discovery' ${peerId.detail.id.toString()}`);
      // await mh.handleDiscovery(peerId);
      const handler = handlers.get('peer:discovery');
      if (handler) {
        try {
          handler(peerId);
        } catch (error) {
          console.log(error);
        }
      }
    });

    /*
     * Handle incoming pubsub messages =========================================
     */
    libp2p.pubsub.addEventListener('message', async (evt) => {
      // console.debug('pubsub message', evt);
      logger.debug(
        'pubsub:message',
        evt.detail.topic.toString(),
        evt.detail.data.toString(),
      );
      // await mh.handleMessage(evt);
      const handler = handlers.get('pubsub:message');
      if (handler) {
        handler(evt);
      }
    });

    /*
     * subscribe to pubsub topics ==============================================
     */
    logger.debug('subscribing to', this.options.allowedTopics);
    for (let i = 0; i < this.options.allowedTopics.length; i++) {
      // console.debug('subscribing to', this.options.allowedTopics[i]);
      logger.debug('subscribing to', this.options.allowedTopics[i]);
      libp2p.pubsub.subscribe(this.options.allowedTopics[i]);
    }

    /*
     * Handle incoming /ibp/ping messages at a protocol level ==================
     */
    libp2p.handle(['/ibp/ping'], (event) => {
      const { stream, connection } = event;
      // console.debug('handle("/ibp/ping")', stream, connection);
      logger.debug('handle("/ibp/ping")', stream, connection);
      // return mh.handleProtocol({ stream, connection, protocol: '/ibp/ping' });
      const handler = handlers.get('/ibp/ping');
      if (handler) {
        handler({ stream, connection });
      }
    });

    this.libp2p = libp2p;

    // return control back to the main.ts
    callback();
  }

  logZMQEvent(event: any) {
    logger.debug(`logEvent(): ${event}`);
  }

  // {"pattern":{"command":"pubsub.peers"},"data":{},"id":"aaf48d96d87acf635fab3"}
  async handleZMQMessage(
    inPacket: ReadPacket<any> & PacketId,
  ): Promise<WritePacket & PacketId> {
    logger.debug('handleZMQMessage', inPacket);
    // this.libp2p.send(message);
    const outPacket: WritePacket & PacketId = {
      id: inPacket.id,
      response: {
        pattern: { command: inPacket.pattern.command + '.response' },
        data: {},
      },
    };
    switch (inPacket?.pattern?.command) {
      case 'ping':
        // response = await this.libp2pServer.ping(message.params);
        // response = { id: message.id, pattern: { command: 'pong' } };
        break;
      case 'pubsub.peers':
        logger.debug(`doing pubsub.peers`);
        const peers = this.libp2p.pubsub.getPeers();
        outPacket.response.data = { peers };
        // response = {
        //   id: message.id || 0,
        //   pattern: { command: message.pattern.command + '.response' },
        //   data: { id: message.id, result: peers },
        // };
        break;
      case 'healthCheck':
        logger.debug(`publishing healthCheck`);
        const publishCheckResult = await this.libp2p.pubsub.publish(
          '/ibp/healthCheck',
          uint8ArrayFromString(JSON.stringify(inPacket.data)),
        );
        logger.debug(`publishing healthCheck result`, publishCheckResult);
        outPacket.response.data = { publishCheckResult };
        break;
      default:
        logger.debug(
          'handleZMQMessage: unknown method',
          `|${inPacket.pattern.command}|`,
        );
    }
    logger.debug('handleZMQMessage responding with', JSON.stringify(outPacket));
    return outPacket;
  }

  /**
   * Publish a message to a topic on the pubsub network.
   */
  async publishMessage(protocol: string, message: any): Promise<PublishResult> {
    // console.debug('publishMessage', protocol, message);
    logger.debug('publishMessage', protocol, message);
    const res = await this.libp2p.pubsub.publish(
      protocol,
      uint8ArrayFromString(JSON.stringify(message)),
    );
    logger.debug('publishMessage', res);
    return res;
  }

  /**
   * This method is triggered on application shutdown.
   */
  async close() {
    logger.debug(`close(): Shutting down port ${this.options.tcpPort}`);
    await this.libp2p.stop();
    this.started = false;
  }

  // @MessagePattern('libp2p://ibp/ping')
  // async ping(@Payload() message: any, @Ctx() context: any) {
  //   // console.debug('ping', message, context);
  //   logger.debug('ping', message, context);
  //   return 'pong';
  // }
}
