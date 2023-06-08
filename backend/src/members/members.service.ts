import { Injectable, Inject } from '@nestjs/common';

import { Member } from '../models/member.js';
import { Libp2pService } from '../libp2p/libp2p.service.js';
import { MemberService } from '../models/member-service.js';
import { MembershipLevel } from '../models/membership-level.js';

@Injectable()
export class MembersService {
  constructor(
    // @InjectRepository(Member) private membersRepository: Repository<Member>,
    // @InjectRepository(MemberService) private memberServicesRepository: Repository<MemberService>,
    private readonly libp2pService: Libp2pService,
    @Inject('MEMBER_SERVICES_REPOSITORY') private memberServicesRepository: typeof MemberService,
    @Inject('MEMBERS_REPOSITORY') private membersRepository: typeof Member,
  ) {}

  getPeerId(): string {
    const peerId = this.libp2pService.getPeerId();
    if (peerId) {
      return peerId.toString();
    } else {
      return '';
    }
  }

  async findAll(): Promise<Member[]> {
    return await this.membersRepository.findAll();
  }

  async findOne(id: string): Promise<Member | null> {
    return await this.membersRepository.findByPk(id, {
      include: [MemberService, MembershipLevel],
    });
  }

  async count(): Promise<number> {
    return await this.membersRepository.count();
  }

  async memberServices(id: string): Promise<MemberService[]> {
    return await this.memberServicesRepository.findAll({ where: { memberId: id } });
  }

  async remove(id: string): Promise<void> {
    await this.membersRepository.destroy({ where: { id } });
  }
}
