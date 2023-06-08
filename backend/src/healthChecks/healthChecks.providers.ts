import { HealthCheck } from '../models/health-check.js';

export const healthChecksProviders = [
  {
    provide: 'HEALTHCHECKS_REPOSITORY',
    useValue: HealthCheck,
  },
];
