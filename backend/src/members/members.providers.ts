import { Member } from '../models/member.js';

export const membersProviders = [
  {
    provide: 'MEMBERS_REPOSITORY',
    useValue: Member,
  },
];
