import { ModuleRef } from '@nestjs/core';
import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';

import fs from 'fs';
import { Libp2p, createLibp2p } from 'libp2p';
import { PeerId } from '@libp2p/interface-peer-id';
import { PeerInfo } from '@libp2p/interface-peer-info';
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
import { CustomEvent, Message } from '../interface/polyfill.js';

import { ILibp2pOptions } from './libp2p.interfaces.js';
import { Libp2pService } from './libp2p.service.js';

const logger = new Logger('Libp2pGateway');

/**
 * Libp2pGateway handles the techical connection to the libp2p network<br>
 * Libp2pService handles the application logic between the monitor and libp2p gateway
 */
@Injectable()
export class Libp2pGateway implements OnModuleInit {
  //private options: ILibp2pOptions;
  private libp2pService: Libp2pService;
  protected peerId: PeerId;
  private server: Libp2p;
  protected started = false;
  // protected readonly ee: EventEmitter2;

  constructor(
    @Inject('LIBP2P_OPTIONS') private options: ILibp2pOptions,
    private readonly moduleRef: ModuleRef,
  ) {
    logger.debug('constructor', options);
    this.options = options;
    // this.ee = eventEmitter;
  }

  getPeerId() {
    return this.peerId;
  }

  async getPeers() {
    return this.server?.getPeers() || [];
  }

  async onModuleInit() {
    this.libp2pService = this.moduleRef.get<Libp2pService>(Libp2pService);

    logger.debug('onModuleInit', JSON.stringify(this.options));
    /*
     * read or create the peerId ===============================================
     */
    if (fs.existsSync('../keys/peer-id.json')) {
      logger.debug('Found existing peer-id.json');
      const pidJson = JSON.parse(
        fs.readFileSync('../keys/peer-id.json', 'utf-8'),
      );
      // console.debug(pidJson)
      this.peerId = await createFromJSON(pidJson);
    } else {
      logger.debug('Creating new peer-id.json');
      this.peerId = await createEd25519PeerId();
      fs.writeFileSync(
        '../keys/peer-id.json',
        JSON.stringify({
          id: this.peerId.toString(),
          privKey: uint8ArrayToString(this.peerId.privateKey, 'base64'),
          pubKey: uint8ArrayToString(this.peerId.publicKey, 'base64'),
        }),
        'utf-8',
      );
    }
    logger.debug('Our monitorID:', this.peerId.toString());

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
      // signMessages: true,
      // strictSigning: true,
      // messageCache: false,
      // scoreParams: {},
      // directPeers: [],
      // allowedTopics: [ '/fruit' ]
      allowedTopics: this.options.allowedTopics,
    });

    logger.debug('Creating libp2p node', this.options);
    logger.debug('binding to port', this.options.tcpPort);
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

    // TODO: where do we upsert our own peerId?
    // // update our monitor record with computed multiAddrs
    // await this.sequelize.models.Monitor.upsert({
    //   id: this.peerId.toString(),
    //   name: 'local',
    //   multiaddress: libp2p.getMultiaddrs(),
    // });

    /*
     * Handle peer connections =================================================
     */
    libp2p.addEventListener('peer:connect', (connection) =>
      this.libp2pService.handlePeerConnect(connection),
    );
    libp2p.addEventListener('peer:disconnect', (connection) =>
      this.libp2pService.handlePeerDisconnect(connection),
    );
    libp2p.addEventListener('peer:discovery', (peerInfo) => {
      if (!this.started || !this.server) {
        logger.warn('peer:discovery', 'LIBP2P not started');
        return;
      }
      logger.debug(`'peer:discovery' ${this.peerId.toString()}`);
      logger.debug(
        `'peer:discovery' we have ${this.server.getPeers().length} peers`,
      );
      // console.log(peerId.detail.id);
      if (peerInfo.detail && peerInfo.detail.id && peerInfo.detail.multiaddrs) {
        this.libp2pService.handlePeerDiscovery(peerInfo);
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
      // await this.handlePubsubMessage(evt);
      await this.libp2pService.handlePubsubMessage(evt);
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
      // const handler = handlers.get('/ibp/ping');
      // if (handler) {
      //   handler({ stream, connection });
      // }
    });

    this.server = libp2p;
  }

  /**
   * Publish a message to a topic on the libp2p network via pubsub
   * @param topic
   * @param data
   */
  async publish(topic: string, data: Uint8Array) {
    logger.debug('publish', topic, uint8ArrayToString(data));
    if (!this.server.pubsub) {
      logger.warn('pubsub not started??!!');
      return;
    }
    return await this.server.pubsub.publish(topic, data);
  }
}
