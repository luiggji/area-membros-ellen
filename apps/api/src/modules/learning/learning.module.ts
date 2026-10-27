import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { CONTENT_ADMIN_STORE, ContentAdminStore } from './application/content-admin';
import {
  SupabaseContentAdminStore,
  UnconfiguredContentAdminStore,
} from './infrastructure/supabase-content-admin';
import { ContentAdminController } from './presentation/content-admin.controller';

/** Conteúdo: editor da owner (CF-081). Catálogo, player e progresso entram nas próximas Issues. */
@Module({
  controllers: [ContentAdminController],
  providers: [
    {
      provide: CONTENT_ADMIN_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): ContentAdminStore =>
        client ? new SupabaseContentAdminStore(client) : new UnconfiguredContentAdminStore(),
    },
  ],
})
export class LearningModule {}
