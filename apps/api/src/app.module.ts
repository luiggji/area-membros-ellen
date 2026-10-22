import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './modules/health/health.module';
import { validateEnv } from './shared/config/env';
import { RateLimitModule } from './shared/http/rate-limit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    RateLimitModule,
    HealthModule,
  ],
})
export class AppModule {}
