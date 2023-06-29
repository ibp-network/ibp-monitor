import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ModuleRef } from '@nestjs/core';
import { Sequelize } from 'sequelize-typescript';

// import fs from 'fs';
// import { Libp2p, createLibp2p } from 'libp2p';
import { PeerId } from '@libp2p/interface-peer-id';
import { PeerInfo } from '@libp2p/interface-peer-info';
import { Multiaddr } from '@multiformats/multiaddr';
// import { bootstrap } from '@libp2p/bootstrap';
// import { mdns } from '@libp2p/mdns';
// import { tcp } from '@libp2p/tcp';
// import { noise } from '@chainsafe/libp2p-noise';
// import { mplex } from '@libp2p/mplex';
// import { kadDHT } from '@libp2p/kad-dht';
// import { gossipsub } from '@chainsafe/libp2p-gossipsub';
// import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery';
// import { createEd25519PeerId, createFromJSON } from '@libp2p/peer-id-factory';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
// import { isIPv4, isIPv6 } from 'is-ip';
// import isValidHostname from 'is-valid-hostname';
import { CustomEvent, Message } from '../interface/polyfill.js';

// import { Libp2pServer } from './libp2p.transporter.js';
import config from '../../config/config.js';
import { Libp2pGateway } from './libp2p.gateway.js';
// import { ILibp2pOptions } from './libp2p.interfaces.js';

import { MemberService } from '../models/member-service.js';
import { HealthCheck } from '../models/health-check.js';

const logger = new Logger('Libp2pService');

/**
 * Libp2pService handles the application logic between the monitor and libp2p gateway<br>
 * Libp2pGateway handles the techical connection to the libp2p network
 */
@Injectable()
export class Libp2pService implements OnModuleInit {
  private libp2pGateway: Libp2pGateway;
  protected peerId: PeerId;
  protected started = false;

  constructor(
    private moduleRef: ModuleRef,
    @Inject('SEQUELIZE') private sequelize: Sequelize,
  ) {}

  onModuleInit() {
    logger.debug('onModuleInit');
    // libp2pGateway is injected lazily to avoid circular dependency
    this.libp2pGateway = this.moduleRef.get<Libp2pGateway>(Libp2pGateway);
  }

  async setPeer(peerId: PeerId, addresses: Multiaddr[]) {
    this.peerId = peerId;
    await this.sequelize.models.Monitor.upsert({
      id: peerId.toString(),
      multiaddress: addresses,
      meta: {
        name: config.name,
      },
      status: 'active',
      updatedAt: new Date(),
    });
  }

  getPeerId() {
    // return this.peerId;
    return this.libp2pGateway.getPeerId();
  }
  // // the gateway will call this method when it has a peerId
  // setPeerId(peerId: PeerId) {
  //   this.peerId = peerId;
  // }
  async getPeers() {
    return this.libp2pGateway.getPeers();
  }

  /**
   * announce the monitor's metadata to the libp2p network via pubsub
   * managed by tasks.task-service.ts
   */
  @OnEvent('announceMeta')
  async announceMeta() {
    logger.debug('announce');
    const meta = JSON.stringify({
      name: config.name,
    });
    return await this.libp2pGateway.publish('/ibp/announce', uint8ArrayFromString(meta));
  }

  /**
   * Publish a message to a topic on the libp2p network via pubsub
   * @param topic
   * @param data
   */
  async publish(topic: string, data: Uint8Array) {
    logger.debug('publish', topic, uint8ArrayToString(data));
    return await this.libp2pGateway.publish(topic, data);
  }

  async handlePeerDiscovery(peerInfo: CustomEvent<PeerInfo>) {
    logger.debug(`handlePeerDiscovery' ${peerInfo.detail.id.toString()}`);
    if (peerInfo.detail && peerInfo.detail.id && peerInfo.detail.multiaddrs) {
      try {
        await this.sequelize.models.Monitor.upsert({
          id: peerInfo.detail.id.toString(),
          multiaddress: peerInfo.detail.multiaddrs,
        });
      } catch (err) {
        logger.error(err);
      }
    }
  }

  async handlePeerConnect(connection: any) {
    logger.debug(
      `handlePeerConnect' ${connection.detail.remotePeer?.toString()}`,
    );
    await this.sequelize.models.Monitor.upsert({
      id: connection.detail.remotePeer.toString(),
      updatedAt: new Date(),
    }, { fields: ['updatedAt'] });
  }

  async handlePeerDisconnect(connection) {
    logger.debug(
      `handlePeerDisconnect' ${connection.detail.remotePeer.toString()}`,
    );
  }

  async handlePubsubMessage(evt: CustomEvent<Message | any>) {
    // logger.debug('handlePeerConnect', data);
    logger.debug(
      `handlePubsubMessage: ${
        evt.detail.topic
      } from ${evt.detail.from.toString()}`,
      // uint8ArrayToString(evt.detail.data),
    );
    let model: any;
    const record = JSON.parse(uint8ArrayToString(evt.detail.data));
    const monitorId = evt.detail.from.toString();

    switch (evt.detail.topic) {
      // a peer has announced itself
      case '/ibp/announce':
        logger.debug(`/ibp/announce from ${monitorId}`);
        await this.sequelize.models.Monitor.upsert({
          id: monitorId,
          status: 'active',
          meta: record,
        });
      // a peer has published some results
      case '/ibp/healthCheck':
        const { memberId, serviceId, peerId } = record;
        logger.debug(
          `/ibp/healthCheck from ${monitorId} for ${memberId}, ${serviceId}, ${peerId}`,
        );
        model = {
          ...record,
          monitorId,
          // serviceUrl: record.serviceUrl,
          // level: record.level || 'info',
          source: 'gossip',
        };
        // make sure the monitor exists - it's possible to get a healthCheck before a monitor publishes its peerId
        logger.debug('upsert monitor', monitorId);
        await this.sequelize.models.Monitor.upsert({
          id: monitorId,
          // multiaddress: [],
          status: 'active',
        });
        // console.log('model for update', model)
        const memberServiceNode =
          await this.sequelize.models.MemberServiceNode.findByPk(peerId);
        if (!memberServiceNode) {
          const memberService =
            (await this.sequelize.models.MemberService.findOne({
              where: { memberId, serviceId },
            })) as MemberService;
          if (memberService) {
            if (!peerId) {
              console.log('New member service node has null stash. Ignore.');
            } else {
              console.log(
                'New member service node:',
                memberId,
                serviceId,
                peerId,
              );
              const node = {
                peerId,
                serviceId,
                memberId,
                // memberServiceId: memberService.id,
              };
              await this.sequelize.models.MemberServiceNode.create(node);
            }
          } else {
            console.error('Member service not found:', memberId, serviceId);
            break;
          }
        }
        logger.debug('upsert health check', memberId, serviceId, peerId);
        const hc = (await this.sequelize.models.HealthCheck.create(
          model,
        )) as HealthCheck;
        logger.debug(
          `Created health check ${hc.id} for ${memberId}, ${serviceId}, ${peerId}`,
        );
        break;
      // case '/ibp/signedMessage':
      //   console.log(
      //     `received: ${uint8ArrayToString(
      //       evt.detail.data
      //     )} from ${evt.detail.from.toString()} on topic ${evt.detail.topic}`
      //   )
      //   if (evt.detail.from.toString() !== this._libp2p.peerId.toString()) {
      //     const message = JSON.parse(uint8ArrayToString(evt.detail.data))
      //     this._rpc.handleMessage(message)
      //   }
      //   break
      default:
        logger.warn(
          `received: ${uint8ArrayToString(
            evt.detail.data,
          )} from ${evt.detail.from.toString()} on topic ${evt.detail.topic}`,
        );
    }
  }
}
