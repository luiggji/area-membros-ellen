import { HealthResponse, healthResponseSchema } from '@caixa-forte/contracts';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { GetHealthUseCase } from '../application/get-health.use-case';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly getHealth: GetHealthUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Saúde da API (sem PII nem segredos)' })
  @ApiOkResponse({ description: 'API no ar', schema: contractSchema(healthResponseSchema) })
  @ApiTooManyRequestsResponse({ description: 'Rate limit por IP excedido (CF-152)' })
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
