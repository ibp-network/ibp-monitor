import { Inject, Controller, Get, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { Member } from '../models/member.js';
import { MembersService } from './members.service.js';
import { Logger } from '@nestjs/common';

// import { CustomEvent } from '../interface/polyfill.js';
import { Sequelize } from 'sequelize-typescript';

const logger = new Logger('MembersController');

// const response = {
//   version: '1.3.0',
//   localMonitorId: '12D3KooWRkQLD8QTVnGpJS5ytnTW73Dr34F1GrUGrd73DtdVNk23',
//   dateTimeFormat: 'DD/MM/YYYY HH:mm',
//   members: [
//     {
//       "id": "amforc",
//       "name": "Amforc",
//       "websiteUrl": "https://amforc.com", "logoUrl": "",
//       "serviceIpAddress": "213.167.226.188",
//       "membershipType": "professional",
//       "membershipLevelId": 7,
//       "membershipLevelTimestamp": 1672549200,
//       "status": "active",
//       "region": "europe",
//       "latitude": 47.1449,
//       "longitude": 8.1551,
//       "createdAt": new Date("2023-04-19T13:45:38.000Z"),
//       "updatedAt": new Date("2023-04-19T13:45:38.000Z")
//     },
//     {"id":"dwellir","name":"Dwellir","websiteUrl":"https://dwellir.com","logoUrl":"https://raw.githubusercontent.com/ibp-network/config/main/logos/dwellir.png","serviceIpAddress":"102.69.242.203","membershipType":"professional","membershipLevelId":3,"membershipLevelTimestamp":1681916382,"status":"active","region":"africa","latitude":6.4541,"longitude":3.3947,"createdAt":"2023-04-25T10:15:02.000Z","updatedAt":"2023-04-25T10:15:02.000Z"},
//     {"id":"gatotech","name":"Gatotech","websiteUrl":"https://gatotech.uk","logoUrl":"https://raw.githubusercontent.com/ibp-network/config/main/logos/gatotech.png","serviceIpAddress":"190.124.251.100","membershipType":"professional","membershipLevelId":7,"membershipLevelTimestamp":1672549200,"status":"active","region":"central_america","latitude":9.9333,"longitude":-84.0845,"createdAt":"2023-04-19T13:45:38.000Z","updatedAt":"2023-04-19T13:45:38.000Z"},
//     {"id":"helikon","name":"Helikon","websiteUrl":"https://helikon.io","logoUrl":"https://raw.githubusercontent.com/ibp-network/config/main/logos/helikon.png","serviceIpAddress":"82.222.18.146","membershipType":"professional","membershipLevelId":7,"membershipLevelTimestamp":1672549200,"status":"active","region":"middle_east","latitude":41.0551,"longitude":28.9347,"createdAt":"2023-04-19T13:45:38.000Z","updatedAt":"2023-04-19T13:45:38.000Z"},
//     {"id":"metaspan","name":"Metaspan","websiteUrl":"https://metaspan.io","logoUrl":"https://raw.githubusercontent.com/ibp-network/config/main/logos/metaspan.png","serviceIpAddress":"195.144.22.130","membershipType":"professional","membershipLevelId":7,"membershipLevelTimestamp":1672549200,"status":"active","region":"europe","latitude":51.4964,"longitude":-0.1224,"createdAt":"2023-04-19T13:45:38.000Z","updatedAt":"2023-04-19T13:45:38.000Z"},
//     {"id":"stakeplus","name":"Stake Plus","websiteUrl":"https://stake.plus","logoUrl":"https://raw.githubusercontent.com/ibp-network/config/main/logos/stakeplus.png","serviceIpAddress":"192.96.202.175","membershipType":"professional","membershipLevelId":7,"membershipLevelTimestamp":1672549200,"status":"active","region":"north_america","latitude":38.7777,"longitude":-77.5474,"createdAt":"2023-04-19T13:45:38.000Z","updatedAt":"2023-04-19T13:45:38.000Z"},
//     {"id":"turboflakes","name":"Turboflakes","websiteUrl":"https://turboflakes.io","logoUrl":"https://raw.githubusercontent.com/ibp-network/config/main/logos/turboflakes.png","serviceIpAddress":"188.93.234.134","membershipType":"professional","membershipLevelId":7,"membershipLevelTimestamp":1680148800,"status":"active","region":"europe","latitude":38.7057,"longitude":-9.1359,"createdAt":"2023-04-19T13:45:38.000Z","updatedAt":"2023-04-19T13:45:38.000Z"}
//   ] as Member[],
// };

interface MemberResponse {
  dateTimeFormat?: string;
  localMonitorId?: string;
  member: Member;
  memberServices?: any[];
  version?: string;
  services: any[];
}

@Controller('member')
export class MembersController {

  constructor(
    private readonly configService: ConfigService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    // private readonly moduleRef: ModuleRef,
    private readonly membersService: MembersService
  ) {}

  // @MessagePattern('local:peerId')
  // async handlePeerId(peerId: CustomEvent<any>) {
  //   logger.log('handlePeerId', peerId.toString());
  //   this.peerId = peerId.toString();
  // }

  @Get()
  async findAll(@Req() request: Request): Promise<any> {
    console.log('findAll', request.params);
    logger.log('findAll', request.params);
    // return [] as Member[];
    const members = await this.membersService.findAll();
    const version = this.configService.get<string>('app.version');
    const localMonitorId = this.membersService.getPeerId();
    const dateTimeFormat = 'DD/MM/YYYY HH:mm';

    return {
      members,
      version,
      localMonitorId,
      dateTimeFormat,
    }
  }

  @Get(':id')
  async findOne(@Req() request: Request): Promise<MemberResponse> {
    console.log('findOne', request.params);
    const member = await this.membersService.findOne(request.params.id);
    const memberServices = await this.membersService.memberServices(request.params.id);
    // const found = response.members.find(
    //   (member) => member.id === request.params.id,
    // );
    // found.createdAt = new Date(found.createdAt);
    // found.updatedAt = new Date(found.updatedAt);
    // return found as Member;
    return {
      dateTimeFormat: 'DD/MM/YYYY HH:mm',
      localMonitorId: this.membersService.getPeerId(),
      member,
      memberServices,
      services: [],
      version: this.configService.get<string>('app.version'),
    }
  }

  @Get(':memberId/healthChecks')
  async memberChecks(@Req() request: Request): Promise<any> {
    console.log('memberChecks', request.params);
    const memberId = request.params.memberId;
    const healthChecks = await this.sequelize.models.HealthCheck.findAll({ where: { memberId }, order: [['createdAt', 'DESC']], limit: 50 });
    return { healthChecks };
  }

  @Get(':memberId/nodes')
  async memberNodes(@Req() request: Request): Promise<any> {
    console.log('memberChecks', request.params);
    const memberId = request.params.memberId;
    const nodes = await this.sequelize.models.MemberServiceNode.findAll({ where: { memberId }, order: [['serviceId', 'ASC']] }) as any[];
    return { nodes };
  }
}
