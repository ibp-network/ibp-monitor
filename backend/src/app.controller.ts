import { Controller, Get } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MessagePattern } from '@nestjs/microservices';
import { CustomEvent } from './interface/polyfill.js';

import zmq from 'zeromq';

import { AppService } from './app.service.js';

const logger = new Logger('AppController');

@Controller()
export class AppController {
  zmqClient: zmq.Socket;

  constructor(
    // private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    logger.log('AppController constructor');
  }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // @MessagePattern('local:peerId')
  // async handlePeerId(peerId: CustomEvent<any>) {
  //   logger.log('handlePeerId', peerId.toString());
  //   this.appService.setPeerId(peerId.toString());
  // }
}
