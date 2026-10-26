import { Global, Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { ACCESS_READER, AccessReader } from './application/ports';
import { SupabaseAccessReader, UnconfiguredAccessReader } from './infrastructure/supabase-access';
import { AccessGuard } from './presentation/access';

/** Global: qualquer módulo de conteúdo usa `@RequireAccess()` (CF-046). */
@Global()
@Module({
  providers: [
    AccessGuard,
    {
      provide: ACCESS_READER,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): AccessReader =>
        client ? new SupabaseAccessReader(client) : new UnconfiguredAccessReader(),
    },
  ],
  exports: [AccessGuard, ACCESS_READER],
})
export class MembershipModule {}
