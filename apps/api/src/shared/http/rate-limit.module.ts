import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { Env } from '../config/env';

export const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * Rate limit global por IP (CF-152), com headers X-RateLimit-* e 429 ao estourar.
 * Armazenamento em memória: vale por instância. Com mais de uma instância no host (CF-015),
 * trocar por storage compartilhado.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => [
        {
          ttl: RATE_LIMIT_WINDOW_MS,
          limit: config.get('API_RATE_LIMIT_PER_MINUTE', { infer: true }),
        },
      ],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
