import { ZeromqService } from './zeromq.service.js';

export const zeromqProviders = [
  {
    provide: 'ZEROMQ_SERVICE',
    useValue: ZeromqService,
  },
];
