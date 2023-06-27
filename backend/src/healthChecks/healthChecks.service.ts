import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PeerId } from '@libp2p/interface-peer-id';

import { HealthCheck } from '../models/health-check.js';
import { Libp2pService } from '../libp2p/libp2p.service.js';

@Injectable()
export class HealthChecksService {
  private readonly logger = new Logger('HealthChecksService');

  constructor(
    private configService: ConfigService,
    private libp2pService: Libp2pService,
    @Inject('HEALTHCHECKS_REPOSITORY') private hcRepository: typeof HealthCheck,
  ) {}

  getAppVersion = (): string => this.configService.get<string>('app.version');
  getDateTimeFormat = (): string => this.configService.get<string>('app.dateTimeFormat');
  getPeerId = (): PeerId => this.libp2pService.getPeerId();

  async findAll(query: any): Promise<any> {
    const { where = {}, offset = 0, limit = 10 } = query;
    const count = await this.hcRepository.count({ where });
    // const limit = 10;
    // const offset = 0;
    const localMonitorId = this.getPeerId();
    const pagination = this.pagination(count, offset, limit);
    const version = this.configService.get<string>('app.version');
    const models = await this.hcRepository.findAll({ where, offset, limit });
    return { localMonitorId, count, limit, offset, pagination, version, models };
  }

  async findOne(id: string): Promise<any> {
    const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    const model = await this.hcRepository.findByPk(id);
    const localMonitorId = this.getPeerId();
    const version = this.configService.get<string>('app.version');
    return {
      localMonitorId,
      dateTimeFormat,
      model,
      version,
    };
  }

  async count(): Promise<number> {
    return await this.hcRepository.count();
  }

  pagination(count, offset, limit) {
    this.logger.debug('pagination', count, offset, limit);
    let pages = [];
    const pageCount = Math.ceil(count / limit);
    const currentPage = Math.min(Math.ceil(offset / limit) + 1, pageCount); // 11/2 = 5
    // console.debug('currentPage', currentPage)
    for (let i = 1; i <= pageCount; i++) {
      const page = {
        query: `?offset=${(i - 1) * limit}&limit=${limit}`,
        class: 'pagination-link',
        text: `${i}`,
        current: i == currentPage,
      };
      pages.push(page);
    }
    if (pages.length > 10) {
      if (currentPage <= 3 || currentPage >= pageCount - 3) {
        pages = [].concat(
          pages.slice(0, 5),
          [{ class: 'pagination-ellipsis', text: '∙∙∙' }],
          pages.slice(-5),
        );
      } else {
        pages = [].concat(
          pages.slice(0, 1),
          [{ class: 'pagination-ellipsis', text: '∙∙∙' }],
          pages.slice(currentPage - 3, currentPage + 2),
          [{ class: 'pagination-ellipsis', text: '∙∙∙' }],
          pages.slice(-1),
        );
      }
    }
    // console.debug(pages)
    const prev = {
      query: `?offset=${Math.max(offset - limit, 0)}&limit=${limit}`,
    };
    const next =
      currentPage < pageCount
        ? { query: `?offset=${offset + limit}&limit=${limit}` }
        : { query: `?offset=${offset}&limit=${limit}` };
    // console.debug('next', next)
    return { pages, prev, next };
  }

  async remove(id: string): Promise<void> {
    await this.hcRepository.destroy({ where: { id } });
  }
}
