/* eslint-disable prettier/prettier */
import { Controller, Inject, Get, Req } from '@nestjs/common';
// import { AppService } from './app.service';
import { Request } from 'express';
// import { Member } from '../models/member.js';
// import { Service } from '../models/service.js';
import { MemberService } from '../models/member-service.js';
import { MemberServicesService } from './memberServices.service.js';

@Controller('memberService')
export class MemberServicesController {
  // constructor(private readonly appService: AppService) {}
  constructor(
    @Inject('MEMBER_SERVICES_REPOSITORY') private memberServicesRepository: typeof MemberService,
  ) {}

  @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  findAll(@Req() request: Request): any {
    console.log('findAll', request.params);
    // return [] as Member[];
    // return response;
    return this.memberServicesRepository.findAll();
  }

  // @Get(':id')
  // async findOne(@Req() request: Request): Promise<MemberResponse> {
  //   console.log('findOne', request.params);
  //   return await this.memberServicesRepository.findByPk(request.params.id);
  // }
}
