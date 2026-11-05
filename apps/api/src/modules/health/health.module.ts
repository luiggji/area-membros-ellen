import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { GetHealthUseCase } from './application/get-health.use-case';
import { CLOCK, DEPENDENCY_CHECKERS, DependencyChecker } from './application/ports';
import { AuditLogChecker } from './infrastructure/audit-log.checker';
import { StorageChecker } from './infrastructure/storage.checker';
import { SystemClock } from './infrastructure/system-clock';
import { HealthController } from './presentation/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    GetHealthUseCase,
    { provide: CLOCK, useClass: SystemClock },
    // Sem Supabase (dev, CI) não há dependência a checar. E-mail/gateway entram com os adapters (CF-017).
    {
      provide: DEPENDENCY_CHECKERS,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): DependencyChecker[] =>
        client ? [new AuditLogChecker(client), new StorageChecker(client)] : [],
    },
  ],
})
export class HealthModule {}
