import { MeResponse, meResponseSchema, permissionsFor } from '@caixa-forte/contracts';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { Principal } from '../application/ports';
import { Authenticated, CurrentPrincipal } from './authorization';

@ApiTags('identity')
@Controller('me')
export class MeController {
  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Papéis e permissões de quem está logado (sem PII)' })
  @ApiOkResponse({ schema: contractSchema(meResponseSchema) })
  me(@CurrentPrincipal() principal: Principal): MeResponse {
    return {
      userId: principal.userId,
      roles: principal.roles,
      permissions: permissionsFor(principal.roles),
    };
  }
}
