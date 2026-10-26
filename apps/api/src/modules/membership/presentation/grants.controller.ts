import {
  AccessGrantList,
  accessGrantListSchema,
  GrantAccessRequest,
  grantAccessRequestSchema,
} from '@caixa-forte/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { ZodPipe } from '../../../shared/http/zod-pipe';
import { Principal } from '../../identity/application/ports';
import { CurrentPrincipal, RequirePermission } from '../../identity/presentation/authorization';
import { GRANT_STORE, grantAccess, GrantStore } from '../application/access-grants';

/** Concessões manuais de acesso pago (CF-048): só o owner (access.grant, com MFA). */
@ApiTags('membership')
@Controller('admin/acessos')
export class GrantsController {
  constructor(@Inject(GRANT_STORE) private readonly store: GrantStore) {}

  @Get()
  @RequirePermission('access.grant')
  @ApiOperation({ summary: 'Concessões manuais (mais recentes primeiro)' })
  @ApiOkResponse({ schema: contractSchema(accessGrantListSchema) })
  async list(): Promise<AccessGrantList> {
    return { grants: await this.store.list() };
  }

  @Post()
  @RequirePermission('access.grant')
  @ApiOperation({ summary: 'Conceder acesso pago com validade e motivo (auditado)' })
  async grant(
    @Body(new ZodPipe(grantAccessRequestSchema)) body: GrantAccessRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ id: string }> {
    const result = await grantAccess(this.store, body, principal.userId);
    if (result.status === 'invalid_date') {
      throw new BadRequestException({
        message: 'invalid_body',
        fields: { validUntil: 'A validade precisa ser uma data futura.' },
      });
    }
    if (result.status === 'member_not_found') throw new NotFoundException('member_not_found');
    return { id: result.id };
  }

  @Post(':id/revogar')
  @HttpCode(200)
  @RequirePermission('access.grant')
  @ApiOperation({ summary: 'Revogar uma concessão manual ativa (auditado)' })
  async revoke(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ revoked: true }> {
    if (!(await this.store.revoke(id, principal.userId))) {
      throw new NotFoundException('grant_not_found');
    }
    return { revoked: true };
  }
}
