import { Global, Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { GRANT_STORE, GrantStore } from './application/access-grants';
import { ACCESS_READER, AccessReader } from './application/ports';
import { SupabaseAccessReader, UnconfiguredAccessReader } from './infrastructure/supabase-access';
import { SupabaseGrantStore, UnconfiguredGrantStore } from './infrastructure/supabase-grants';
import { AccessGuard } from './presentation/access';
import { GrantsController } from './presentation/grants.controller';

/**
 * Global: qualquer módulo de conteúdo usa `@RequireAccess()` (CF-046). Concessões manuais do
 * owner em `/admin/acessos` (CF-048).
 */
@Global()
@Module({
  controllers: [GrantsController],
  providers: [
    AccessGuard,
    {
      provide: ACCESS_READER,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): AccessReader =>
        client ? new SupabaseAccessReader(client) : new UnconfiguredAccessReader(),
    },
    {
      provide: GRANT_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): GrantStore =>
        client ? new SupabaseGrantStore(client) : new UnconfiguredGrantStore(),
    },
  ],
  exports: [AccessGuard, ACCESS_READER],
})
export class MembershipModule {}
