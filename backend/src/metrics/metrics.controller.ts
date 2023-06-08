import { Controller, Get, Req, Header } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request } from 'express';

import { MetricsService } from './metrics.service.js';

const logger = new Logger('MetricsController');

@Controller('metrics') // <= /api/metrics
export class MetricsController {
  private peerId = 'undefined';

  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  @Header('Content-Type', 'text/plain')
  @Get(':serviceId')
  async getMetrics(@Req() request: Request): Promise<string> {
    logger.log('/metrics', request.params);
    
    let { serviceId } = request.params
    serviceId = decodeURIComponent(serviceId)
    let metrics = await this.metricsService.export(serviceId)
    // res.type('text/plain').send(metrics)

    return metrics
  }
}
