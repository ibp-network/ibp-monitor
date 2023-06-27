import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PeerId } from '@libp2p/interface-peer-id';

import { Libp2pService } from './libp2p/libp2p.service.js';

@Injectable()
export class AppService {
  // private readonly redis: Redis;
  private logger = new Logger('AppService');
  protected peerId = 'undefined';
  protected version = '0.0.0';

  constructor(
    private readonly config: ConfigService,
    private readonly libp2pService: Libp2pService,
  ) {
    const pkg = JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8'));
    this.logger.log(`Package version: ${pkg.version}`);
    this.version = pkg.version;
  }

  // setPeerId(peerId: string) {
  //   this.peerId = peerId;
  // }

  getPeerId(): PeerId {
    return this.libp2pService.getPeerId();
    // return this.peerId;
  }

  // getHello(): string {
  //   return 'Hello World!';
  // }
}
