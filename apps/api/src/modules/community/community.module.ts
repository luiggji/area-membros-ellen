import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { DIRECTORY_SEARCH, DirectorySearch } from './application/directory-search';
import { GROUP_STORE, GroupStore } from './application/groups';
import {
  SupabaseDirectorySearch,
  UnconfiguredDirectorySearch,
} from './infrastructure/supabase-directory-search';
import { SupabaseGroupStore, UnconfiguredGroupStore } from './infrastructure/supabase-groups';
import { DirectoryController } from './presentation/directory.controller';
import { GroupsController } from './presentation/groups.controller';

/** Comunidade: diretório de membros (CF-091) e grupos temáticos (CF-092); posts no CF-094. */
@Module({
  controllers: [DirectoryController, GroupsController],
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
  ],
})
export class CommunityModule {}
