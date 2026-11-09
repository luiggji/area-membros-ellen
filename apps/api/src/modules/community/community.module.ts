import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { DIRECTORY_SEARCH, DirectorySearch } from './application/directory-search';
import {
  SupabaseDirectorySearch,
  UnconfiguredDirectorySearch,
} from './infrastructure/supabase-directory-search';
import { DirectoryController } from './presentation/directory.controller';

/** Comunidade: diretório de membros (CF-091); grupos e posts chegam nas próximas Issues. */
@Module({
  controllers: [DirectoryController],
  providers: [
    {
      provide: DIRECTORY_SEARCH,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): DirectorySearch =>
        client ? new SupabaseDirectorySearch(client) : new UnconfiguredDirectorySearch(),
    },
  ],
})
export class CommunityModule {}
