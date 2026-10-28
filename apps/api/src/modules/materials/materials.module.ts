import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { MATERIAL_STORE, MaterialStore } from './application/materials';
import {
  SupabaseMaterialStore,
  UnconfiguredMaterialStore,
} from './infrastructure/supabase-materials';
import { MaterialsController } from './presentation/materials.controller';
import { MaterialsAdminController } from './presentation/materials-admin.controller';

/** Cofre de materiais (CF-085): arquivos no bucket privado (CF-162), metadados na tabela. */
@Module({
  controllers: [MaterialsController, MaterialsAdminController],
  providers: [
    {
      provide: MATERIAL_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): MaterialStore =>
        client ? new SupabaseMaterialStore(client) : new UnconfiguredMaterialStore(),
    },
  ],
})
export class MaterialsModule {}
