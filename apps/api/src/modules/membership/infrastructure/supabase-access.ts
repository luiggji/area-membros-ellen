import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { AccessReader, AccessScope, MemberAccess } from '../application/ports';

/** A regra mora no banco (uma só definição para RLS, API e web); aqui só se consulta. */
export class SupabaseAccessReader implements AccessReader {
  constructor(private readonly client: SupabaseAdmin) {}

  async accessOf(userId: string, scope: AccessScope): Promise<MemberAccess | null> {
    const { data, error } = await this.client.rpc('access_of_user', {
      p_user: userId,
      p_scope: scope,
    });
    if (error) throw new Error(`access_of_user: falha ao ler acesso (${error.code})`);
    const row = data?.[0];
    if (!row || (row.source !== 'subscription' && row.source !== 'manual')) return null;
    return {
      source: row.source,
      subscriptionStatus: row.subscription_status,
      validUntil: row.valid_until,
    };
  }
}

/** Dev sem Supabase: ninguém tem acesso pago (rotas com paywall respondem 403). */
export class UnconfiguredAccessReader implements AccessReader {
  async accessOf(): Promise<MemberAccess | null> {
    return null;
  }
}
