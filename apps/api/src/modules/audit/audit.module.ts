import { Global, Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { AuditTrail } from './application/audit-trail';
import { AUDIT_LOG, AuditLog } from './application/ports';
import { SupabaseAuditLog } from './infrastructure/supabase-audit-log';
import { UnpersistedAuditLog } from './infrastructure/unpersisted-audit-log';

/** Global: qualquer módulo injeta `AuditTrail` sem importar este módulo (CF-161). */
@Global()
@Module({
  providers: [
    AuditTrail,
    {
      provide: AUDIT_LOG,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): AuditLog =>
        client ? new SupabaseAuditLog(client) : new UnpersistedAuditLog(),
    },
  ],
  exports: [AuditTrail],
})
export class AuditModule {}
