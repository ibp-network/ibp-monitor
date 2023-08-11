import { Logger } from "@nestjs/common";
import axios from "axios";
import { Op, Sequelize } from "sequelize";
import moment from "moment";

import { MemberDef, MembersDef } from "./tasks.interfaces";
import { ServicesDef } from "./tasks.interfaces";
import { Member } from "src/models/member";
import { Service } from "src/models/service";

export class Tasks {
  private readonly logger: Logger;
  private readonly sequelize: Sequelize;

  constructor(logger: Logger, sequelize: Sequelize) {
    this.logger = logger;
    this.sequelize = sequelize;
  }

  async readServices() {
    this.logger.debug('[readServices] starting...');
    const res = await axios.get(
      'https://raw.githubusercontent.com/ibp-network/config/main/services.json',
    );
    if (res.data) {
      const servicesDef: ServicesDef = res.data || {};
      const domains = Object.keys(servicesDef);
      this.logger.warn('[readServices] NOT IMPLEMENTED');
    } else {
      this.logger.error('[readServices] Failed to read services');
    }
  }

  async readMembers () {
    this.logger.debug('[readMembers] starting...');
    const res = await axios.get(
      'https://raw.githubusercontent.com/ibp-network/config/main/members.json',
    );
    if (res.data) {
      const membersDef: MembersDef = res.data || {};
      const memberIds = Object.keys(membersDef.members);
      this.logger.debug(
        '[readMembers] Deactivating active members not in the list',
        `[${memberIds.join(', ')}]`,
      );
      await this.sequelize.models.Member.update(
        { status: 'inactive' },
        {
          where: {
            id: { [Op.notIn]: memberIds },
            status: { [Op.ne]: 'inactive' },
          },
        },
      );
      // this.logger.log('done inactivating those not in the list');
  
      Object.entries(membersDef.members).forEach(async ([memberId, member]) => {
        if (member.active !== '1') return;
        if (member.current_level < '1') return;
        // upsert the member
        // TODO validate member data
        let model = await this.sequelize.models.Member.findByPk(memberId) as Member;
        if (!model) {
          console.debug(`[readMembers] creating new member: ${memberId}`, member);
          try {
            model = await this.sequelize.models.Member.create({
              id: memberId,
              name: member.name,
              websiteUrl: member.website,
              logoUrl: member.logo,
              serviceIpAddress: member.services_address,
              membershipType: member.membership,
              membershipLevelId: member.current_level,
              membershipLevelTimestamp:
                member.level_timestamp[member.current_level],
              status: member.active === '1' ? 'active' : 'pending',
              monitorUrl: member.monitor_url,
              region: member.region,
              latitude: member.latitude,
              longitude: member.longitude,
            }) as Member;  
          } catch (err) {
            this.logger.error(err);
          }
        } else {
          this.logger.debug(`[readMembers] updating member: ${memberId}`);
          await model.update(
            {
              name: member.name,
              websiteUrl: member.website,
              logoUrl: member.logo,
              serviceIpAddress: member.services_address,
              membershipType: member.membership,
              membershipLevelId: member.current_level,
              membershipLevelTimestamp:
                member.level_timestamp[member.current_level],
              status: member.active === '1' ? 'active' : 'pending',
              monitorUrl: member.monitor_url,
              region: member.region,
              latitude: member.latitude,
              longitude: member.longitude,
            },
            { where: { id: memberId } },
          );
        }
        this.updateMemberServices(member, model);
      });
    } else {
      this.logger.error('[readMembers] Failed to read members');
    }
  }

  async updateMemberServices (memberDef: MemberDef, member: Member) {
    this.logger.debug('[UpdateMemberServices] starting...');
    // FIXME: include boot nodes
    const services: Service[] = await this.sequelize.models.Service.findAll({ type: 'rpc' }) as Service[];

    for (let j = 0; j < services.length; j++) {
      const service = services[j];
      if (member.membershipLevelId >= service.membershipLevelId) {
        const memberService = {
          memberId: member.id,
          serviceId: service.id,
          serviceUrl: '', // direct link, outside of IBP
          status: 'active',
        }
        if (memberDef.endpoints) {
          memberService.serviceUrl = memberDef.endpoints[service.chainId] || '';
        }
        await this.sequelize.models.MemberService.upsert(memberService)  
      }
    }
  }

  async pruneDatabase (config: any) {
    this.logger.debug('[pruneDatabase] starting...', config.pruning);
    const marker = moment.utc().add(-config.pruning.age, 'seconds');
    this.logger.debug('[pruneDatabase] marker', marker);
    const result = { monitors: 0, healthChecks: 0, services: 0, members: 0 };

    // Prune healthChecks
    result.healthChecks = await this.sequelize.models.HealthCheck.destroy({
      where: { createdAt: { [Op.lt]: marker.format('YYYY-MM-DD HH:mm:ss') } },
    });
    // result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, errorCount: { [Op.gt]: 10 } } })
    // console.debug('Service.stale: error', result)
    // result = await this.Service.update({ status: 'stale' }, { where: { status: {[Op.ne]: 'stale' }, updatedAt: { [Op.lt]: marker } } })
    // console.debug('Service.stale: updatedAt', result)
    // delete healthChecks for stale services
    // const staleServices = this.Service.findAll({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    // for(var i = 0; i < staleServices.length; i++) {
    //   const svc = staleServices[i]
    //   await this.HealthCheck.destroy({ where: { serviceUrl: svc.serviceUrl } })
    // }
    // result = await this.HealthCheck.destroy({ where: })
    // delete stale services
    // result = await this.Service.destroy({ where: { status: 'stale', updatedAt: { [Op.lt]: marker } } })
    // console.debug('Services.prune: stale', result)

    // TODO prune stale services?
    // TODO prune stale monitors?

    // result.monitors = await this.sequelize.models.Monitor.destroy({
    //   where: {
    //     id: { [Op.notIn]: [this.peerId] },
    //     updatedAt: { [Op.lt]: marker.format('YYYY-MM-DD HH:mm:ss') },
    //   },
    // });
    this.logger.debug(`[pruneDatabase] ${JSON.stringify(result)}`);
  }

}
