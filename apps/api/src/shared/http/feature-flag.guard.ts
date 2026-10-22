import { FeatureFlag } from '@caixa-forte/contracts';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { Env } from '../config/env';

const FEATURE_KEY = 'caixa-forte:feature';

/**
 * Módulo desligado no ambiente (CF-158) responde 404, como se a rota não existisse: não revela
 * o que está por vir nem deixa um caminho meio pronto acessível.
 */
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService<Env, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const feature = this.reflector.getAllAndOverride<FeatureFlag | undefined>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!feature) return true;
    if (this.config.get('features', { infer: true })[feature]) return true;
    throw new NotFoundException();
  }
}

/** Uso no controller (ou na rota): `@RequireFeature('community')`. */
export const RequireFeature = (feature: FeatureFlag) =>
  applyDecorators(SetMetadata(FEATURE_KEY, feature), UseGuards(FeatureFlagGuard));
