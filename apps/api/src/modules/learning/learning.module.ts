import { randomBytes } from 'node:crypto';

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '../../shared/config/env';
import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { CATALOG_READER, CatalogReader } from './application/catalog';
import { CONTENT_ADMIN_STORE, ContentAdminStore } from './application/content-admin';
import { LESSON_READER, LessonReader, MEDIA_TOKENS, VIDEO_PROVIDER } from './application/player';
import { PROGRESS_STORE, ProgressStore } from './application/progress';
import { HmacMediaTokens } from './infrastructure/hmac-media-tokens';
import {
  SupabaseProgressStore,
  UnconfiguredProgressStore,
} from './infrastructure/supabase-progress';
import {
  SupabaseCatalogReader,
  UnconfiguredCatalogReader,
} from './infrastructure/supabase-catalog';
import {
  SupabaseContentAdminStore,
  UnconfiguredContentAdminStore,
} from './infrastructure/supabase-content-admin';
import {
  SupabaseLessonReader,
  UnconfiguredLessonReader,
  UnconfiguredVideoProvider,
} from './infrastructure/supabase-lesson-reader';
import { CatalogController } from './presentation/catalog.controller';
import { ContentAdminController } from './presentation/content-admin.controller';
import { PlayerController } from './presentation/player.controller';

/** Conteúdo: editor (CF-081/CF-172), catálogo (CF-082), player (CF-083) e progresso (CF-084). */
@Module({
  controllers: [ContentAdminController, CatalogController, PlayerController],
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
    {
      provide: LESSON_READER,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): LessonReader =>
        client ? new SupabaseLessonReader(client) : new UnconfiguredLessonReader(),
    },
    {
      provide: PROGRESS_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): ProgressStore =>
        client ? new SupabaseProgressStore(client) : new UnconfiguredProgressStore(),
    },
    // Provedor de vídeo ainda não escolhido (P-007): o adaptador real entra aqui.
    { provide: VIDEO_PROVIDER, useClass: UnconfiguredVideoProvider },
    {
      provide: MEDIA_TOKENS,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const secret = config.get('MEDIA_SIGNING_SECRET', { infer: true });
        return new HmacMediaTokens(secret ? Buffer.from(secret) : randomBytes(32));
      },
    },
  ],
})
export class LearningModule {}
