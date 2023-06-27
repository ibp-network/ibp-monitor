import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';

import { Logger } from '@nestjs/common';

import { Command } from 'commander';
const program = new Command();
program
  .version('', '-v, --version')
  .description('An example CLI for managing a directory')
  .option('-l, --ls  [value]', 'List directory contents')
  .option('-m, --mkdir <value>', 'Create a directory')
  .option('-t, --touch <value>', 'Create a file')
  .parse(process.argv);

import config from '../config/config.js';
import { AppModule } from './app.module.js';

const logger = new Logger('Main');
const HTTP_PORT = config.httpPort || 30001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  logger.log('Connecting WebSocket adapter');
  app.useWebSocketAdapter(new IoAdapter(app));

  app.setGlobalPrefix('api'); // /api

  await app.listen(HTTP_PORT, () => {
    logger.log(`Listening on port ${HTTP_PORT}`);
    process.on('SIGINT', () => {
      logger.log('SIGINT received, shutting down');
      app.close();
      process.exit(0);
    });
  });
}

bootstrap();
