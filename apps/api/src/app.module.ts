import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { validateEnv } from './shared/config/env';
import { RateLimitModule } from './shared/http/rate-limit.module';
import { SupabaseModule } from './shared/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    SupabaseModule,
    RateLimitModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
