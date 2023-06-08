import { Monitor } from '../models/monitor.js';

export const monitorsProviders = [
  {
    provide: 'MONITORS_REPOSITORY',
    useValue: Monitor,
  },
];
