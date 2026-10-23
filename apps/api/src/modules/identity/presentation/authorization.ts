import { can, Permission } from '@caixa-forte/contracts';
import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Request } from 'express';

import { Principal } from '../application/ports';
import { PrincipalResolver } from '../application/principal-resolver';

const PERMISSION_KEY = 'caixa-forte:permission';

type AuthorizedRequest = Request & { principal?: Principal };

function bearer(request: Request): string | undefined {
  const header = request.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7).trim() || undefined : undefined;
}

/**
 * Autorização no servidor (CF-032): 401 sem token válido; 403 sem a permissão exigida. Os papéis
 * vêm do banco a cada requisição, nunca do cliente nem de claims editáveis.
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolver: PrincipalResolver,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const principal = await this.resolver.resolve(bearer(request));
    if (!principal) throw new UnauthorizedException();

    const permission = this.reflector.getAllAndOverride<Permission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (permission && !can(principal.roles, permission)) throw new ForbiddenException();

    request.principal = principal;
    return true;
  }
}

/** Exige só login. */
export const Authenticated = () =>
  applyDecorators(
    UseGuards(AuthorizationGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Sem sessão válida' }),
  );

/** Exige login e a permissão (matriz em @caixa-forte/contracts). Ex.: `@RequirePermission('prices.manage')`. */
export const RequirePermission = (permission: Permission) =>
  applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
    Authenticated(),
    ApiForbiddenResponse({ description: `Sem a permissão ${permission}` }),
  );

/** Quem está chamando, já verificado pelo guard. */
export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal => {
    const principal = context.switchToHttp().getRequest<AuthorizedRequest>().principal;
    if (!principal) throw new UnauthorizedException();
    return principal;
  },
);
