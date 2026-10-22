import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { validateEnv } from './shared/config/env';
import { RateLimitModule } from './shared/http/rate-limit.module';
import { SupabaseModule } from './shared/supabase/supabase.module';

@Module({
  imports: [
    // O env vem do processo (dev: `node --env-file-if-exists=.env`; hosts: variáveis do painel).
    // Sem ler .env aqui, os testes não dependem das chaves locais de quem roda.
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, validate: validateEnv }),
    SupabaseModule,
    RateLimitModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
