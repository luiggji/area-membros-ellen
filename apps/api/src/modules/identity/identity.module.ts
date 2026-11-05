import { Global, Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { PrincipalResolver } from './application/principal-resolver';
import {
  ACCESS_TOKEN_VERIFIER,
  AccessTokenVerifier,
  ROLE_REPOSITORY,
  RoleRepository,
} from './application/ports';
import {
  SupabaseAccessTokenVerifier,
  SupabaseRoleRepository,
  UnconfiguredAccessTokenVerifier,
  UnconfiguredRoleRepository,
} from './infrastructure/supabase-identity';
import { AuthorizationGuard } from './presentation/authorization';
import { MeController } from './presentation/me.controller';

/** Global: qualquer módulo usa `@Authenticated()` e `@RequirePermission()` (CF-032). */
@Global()
@Module({
  controllers: [MeController],
  providers: [
    PrincipalResolver,
    AuthorizationGuard,
    {
      provide: ACCESS_TOKEN_VERIFIER,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): AccessTokenVerifier =>
        client ? new SupabaseAccessTokenVerifier(client) : new UnconfiguredAccessTokenVerifier(),
    },
    {
      provide: ROLE_REPOSITORY,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): RoleRepository =>
        client ? new SupabaseRoleRepository(client) : new UnconfiguredRoleRepository(),
    },
  ],
  exports: [PrincipalResolver, AuthorizationGuard],
})
export class IdentityModule {}
