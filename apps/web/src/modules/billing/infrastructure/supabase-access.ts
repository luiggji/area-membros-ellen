import type { Database } from '@caixa-forte/contracts';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { MemberAccess } from '../domain/member-access';

/** Acesso do titular da sessão, decidido no banco (`my_access`, CF-046); a UI só reflete. */
export async function loadMyAccess(client: SupabaseClient<Database>): Promise<MemberAccess | null> {
  const { data, error } = await client.rpc('my_access');
  if (error) throw new Error(`my_access: falha ao ler acesso (${error.code})`);
  const row = data?.[0];
  if (!row || (row.source !== 'subscription' && row.source !== 'manual')) return null;
  return {
    source: row.source,
    subscriptionStatus: row.subscription_status,
    validUntil: row.valid_until,
  };
}
