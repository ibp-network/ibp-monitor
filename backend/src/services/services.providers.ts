import { Service } from '../models/service.js';

export const servicesProviders = [
  {
    provide: 'SERVICES_REPOSITORY',
    useValue: Service,
  },
];
