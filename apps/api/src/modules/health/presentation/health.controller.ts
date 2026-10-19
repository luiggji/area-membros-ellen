import { HealthResponse } from '@caixa-forte/contracts';
import { Controller, Get } from '@nestjs/common';

import { GetHealthUseCase } from '../application/get-health.use-case';

@Controller('health')
export class HealthController {
  constructor(private readonly getHealth: GetHealthUseCase) {}

  @Get()
  async handle(): Promise<HealthResponse> {
    const report = await this.getHealth.execute();
    return {
      status: report.status,
      service: report.service,
      version: report.version,
      timestamp: report.checkedAt.toISOString(),
    };
  }
}
