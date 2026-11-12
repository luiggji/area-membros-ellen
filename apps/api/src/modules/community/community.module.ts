import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { DIRECTORY_SEARCH, DirectorySearch } from './application/directory-search';
import { GROUP_STORE, GroupStore } from './application/groups';
import { COMMUNITY_STORE, CommunityStore } from './application/membership';
import {
  SupabaseDirectorySearch,
  UnconfiguredDirectorySearch,
} from './infrastructure/supabase-directory-search';
import { SupabaseGroupStore, UnconfiguredGroupStore } from './infrastructure/supabase-groups';
import {
  SupabaseCommunityStore,
  UnconfiguredCommunityStore,
} from './infrastructure/supabase-membership';
import { CommunityController } from './presentation/community.controller';
import { DirectoryController } from './presentation/directory.controller';
import { GroupsController } from './presentation/groups.controller';

/**
 * Comunidade: diretório (CF-091), grupos temáticos no admin (CF-092) e a visão do membro —
 * participação e feed (CF-093). Publicar e comentar chegam no CF-094.
 */
@Module({
  controllers: [DirectoryController, GroupsController, CommunityController],
  providers: [
    {
      provide: DIRECTORY_SEARCH,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): DirectorySearch =>
        client ? new SupabaseDirectorySearch(client) : new UnconfiguredDirectorySearch(),
    },
    {
      provide: GROUP_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): GroupStore =>
        client ? new SupabaseGroupStore(client) : new UnconfiguredGroupStore(),
    },
    {
      provide: COMMUNITY_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): CommunityStore =>
        client ? new SupabaseCommunityStore(client) : new UnconfiguredCommunityStore(),
    },
  ],
})
export class CommunityModule {}
