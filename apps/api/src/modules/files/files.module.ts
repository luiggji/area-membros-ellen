import { Global, Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { FILE_STORAGE, FileStorage } from './application/file-storage';
import {
  SupabaseFileStorage,
  UnconfiguredFileStorage,
} from './infrastructure/supabase-file-storage';

/**
 * Arquivos privados (CF-162). Global: o Cofre de materiais (CF-085) e futuros anexos usam a mesma
 * porta. Sem rota própria: cada contexto decide quem pode subir e baixar.
 */
@Global()
@Module({
  providers: [
    {
      provide: FILE_STORAGE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): FileStorage =>
        client ? new SupabaseFileStorage(client) : new UnconfiguredFileStorage(),
    },
  ],
  exports: [FILE_STORAGE],
})
export class FilesModule {}
