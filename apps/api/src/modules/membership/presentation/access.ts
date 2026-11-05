import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import type { Request } from 'express';

import { Principal } from '../../identity/application/ports';
import { Authenticated } from '../../identity/presentation/authorization';
import { ACCESS_READER, AccessReader, AccessScope } from '../application/ports';

const SCOPE_KEY = 'caixa-forte:access-scope';

/**
 * Paywall no servidor (CF-046): roda depois do guard de autenticação e consulta o acesso no
 * banco a cada requisição. Sem acesso vigente: 403 `subscription_required`. Papel de equipe não
 * dá acesso a conteúdo pago (PRD CF-02).
 */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ACCESS_READER) private readonly reader: AccessReader,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { principal?: Principal }>();
    if (!request.principal) throw new UnauthorizedException();
    const scope =
      this.reflector.getAllAndOverride<AccessScope | undefined>(SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'caixa_forte';
    if (!(await this.reader.accessOf(request.principal.userId, scope))) {
      throw new ForbiddenException('subscription_required');
    }
    return true;
  }
}

/** Exige login e acesso pago vigente. Ex.: `@RequireAccess()` nas rotas de aulas e materiais. */
export const RequireAccess = (scope: AccessScope = 'caixa_forte') =>
  applyDecorators(
    SetMetadata(SCOPE_KEY, scope),
    Authenticated(),
    UseGuards(AccessGuard),
    ApiForbiddenResponse({ description: 'Sem acesso pago vigente (subscription_required)' }),
  );
