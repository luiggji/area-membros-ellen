import {
  AdminPlanList,
  adminPlanListSchema,
  CreatePlanRequest,
  createPlanRequestSchema,
  PublishPriceRequest,
  publishPriceRequestSchema,
  UpdatePlanRequest,
  updatePlanRequestSchema,
} from '@caixa-forte/contracts';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { ZodPipe } from '../../../shared/http/zod-pipe';
import { Principal } from '../../identity/application/ports';
import { CurrentPrincipal, RequirePermission } from '../../identity/presentation/authorization';
import { CatalogWrite, PLAN_STORE, PlanStore } from '../application/plans';

function idOrThrow(result: CatalogWrite, notFound: string): { id: string } {
  if (result.status === 'not_found') throw new NotFoundException(notFound);
  if (result.status === 'duplicate') throw new ConflictException('plan_code_taken');
  return { id: result.id };
}

/**
 * Planos e versões de preço (CF-041): só quem tem `prices.manage` (owner, com MFA). Preço novo
 * vale para novas vendas; contratos vigentes ficam no preço contratado.
 */
@ApiTags('billing')
@Controller('admin/planos')
export class PlansController {
  constructor(@Inject(PLAN_STORE) private readonly store: PlanStore) {}

  @Get()
  @RequirePermission('prices.manage')
  @ApiOperation({ summary: 'Planos com o histórico de preços' })
  @ApiOkResponse({ schema: contractSchema(adminPlanListSchema) })
  async list(): Promise<AdminPlanList> {
    return { plans: await this.store.list() };
  }

  @Post()
  @RequirePermission('prices.manage')
  @ApiOperation({ summary: 'Criar plano (auditado)' })
  async create(
    @Body(new ZodPipe(createPlanRequestSchema)) body: CreatePlanRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ id: string }> {
    return idOrThrow(await this.store.create(body, principal.userId), 'plan_not_found');
  }

  @Patch(':id')
  @RequirePermission('prices.manage')
  @ApiOperation({ summary: 'Editar nome, descrição ou ativar/desativar plano (auditado)' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(updatePlanRequestSchema)) body: UpdatePlanRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ id: string }> {
    return idOrThrow(await this.store.update(id, body, principal.userId), 'plan_not_found');
  }

  @Post(':id/precos')
  @RequirePermission('prices.manage')
  @ApiOperation({ summary: 'Publicar preço novo para novas vendas (auditado)' })
  async publishPrice(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(publishPriceRequestSchema)) body: PublishPriceRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ id: string }> {
    return idOrThrow(await this.store.publishPrice(id, body, principal.userId), 'plan_not_found');
  }
}
