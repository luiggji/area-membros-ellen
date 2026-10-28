import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { CATALOG_READER, CatalogReader } from './application/catalog';
import { CONTENT_ADMIN_STORE, ContentAdminStore } from './application/content-admin';
import {
  SupabaseCatalogReader,
  UnconfiguredCatalogReader,
} from './infrastructure/supabase-catalog';
import {
  SupabaseContentAdminStore,
  UnconfiguredContentAdminStore,
} from './infrastructure/supabase-content-admin';
import { CatalogController } from './presentation/catalog.controller';
import { ContentAdminController } from './presentation/content-admin.controller';

/** Conteúdo: editor da owner (CF-081/CF-172) e catálogo do membro (CF-082). */
@Module({
  controllers: [ContentAdminController, CatalogController],
  providers: [
    {
      provide: CONTENT_ADMIN_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): ContentAdminStore =>
        client ? new SupabaseContentAdminStore(client) : new UnconfiguredContentAdminStore(),
    },
    {
      provide: CATALOG_READER,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): CatalogReader =>
        client ? new SupabaseCatalogReader(client) : new UnconfiguredCatalogReader(),
    },
  ],
})
export class LearningModule {}
