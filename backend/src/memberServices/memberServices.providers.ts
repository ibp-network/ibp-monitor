import { MemberService } from '../models/member-service.js';

export const memberServicesProviders = [
  {
    provide: 'MEMBER_SERVICES_REPOSITORY',
    useValue: MemberService,
  },
];
