// import { HealthCheck } from './healthChecks.entity.js';
import { Libp2pServer } from './libp2p.transporter.js';

export const libp2pProviders = [
  {
    provide: 'LIBP2P_SERVER',
    useValue: Libp2pServer,
  },
];
