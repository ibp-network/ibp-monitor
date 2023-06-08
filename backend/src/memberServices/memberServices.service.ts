import { Injectable, Inject } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberService } from '../models/member-service.js';
import { Member } from '../models/member.js';
import { Service } from '../models/service.js';
// import { MemberService } from '../memberServices/memberServices.entity.js';

@Injectable()
export class MemberServicesService {
  // constructor(
  //   @InjectRepository(MemberService) private memberServicesRepository: Repository<MemberService>,
  //   @InjectRepository(Member) private memberRepository: Repository<Member>,
  //   @InjectRepository(Service) private memberRepository: Repository<Member>,
  // ) {}
  constructor(
    @Inject('MEMBER_SERVICES_REPOSITORY') private memberServicesRepository: typeof MemberService,
    @Inject('MEMBERS_REPOSITORY') private membersRepository: typeof Member,
    @Inject('SERVICES_REPOSITORY') private servicesRepository: typeof Service,
  ) {}

  findAll(): Promise<MemberService[]> {
    return this.memberServicesRepository.findAll();
  }

  forMember(id: string): Promise<MemberService[]> {
    return this.memberServicesRepository.findAll({ where: { memberId: id } });
  }

  forService(id: string): Promise<MemberService[]> {
    return this.memberServicesRepository.findAll({ where: { serviceId: id } });
  }

  // async remove(id: string): Promise<void> {
  //   await this.membersRepository.delete(id);
  // }
}
