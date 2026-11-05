import { MATERIALS_BUCKET } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { DependencyChecker } from '../application/ports';
import { DependencyCheck } from '../domain/health-report';

/**
 * O bucket de materiais (CF-162) existe e é privado. Bucket público conta como falha: arquivo pago
 * não pode ter URL aberta.
 */
export class StorageChecker implements DependencyChecker {
  constructor(private readonly client: SupabaseAdmin) {}

  async check(): Promise<DependencyCheck> {
    const { data, error } = await this.client.storage.getBucket(MATERIALS_BUCKET.id);
    return { name: 'storage', healthy: !error && data?.public === false };
  }
}
