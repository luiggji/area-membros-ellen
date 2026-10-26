import { AccessGrant } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { GrantStore } from '../application/access-grants';

export class SupabaseGrantStore implements GrantStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async userIdByEmail(email: string): Promise<string | null> {
    const { data, error } = await this.client.rpc('user_id_by_email', { p_email: email });
    if (error) throw new Error(`user_id_by_email: falha (${error.code})`);
    return data ?? null;
  }

  async create(input: {
    userId: string;
    reason: string;
    validTo: string;
    grantedBy: string;
  }): Promise<string> {
    const { data, error } = await this.client
      .from('entitlements')
      .insert({
        user_id: input.userId,
        source: 'manual',
        reason: input.reason,
        valid_to: input.validTo,
        granted_by: input.grantedBy,
      })
      .select('id')
      .single();
    if (error) throw new Error(`entitlements: falha ao conceder (${error.code})`);
    return data.id;
  }

  async revoke(id: string, revokedBy: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('entitlements')
      .update({ revoked_at: new Date().toISOString(), revoked_by: revokedBy })
      .eq('id', id)
      .eq('source', 'manual')
      .is('revoked_at', null)
      .select('id');
    if (error) throw new Error(`entitlements: falha ao revogar (${error.code})`);
    return data.length === 1;
  }

  async list(): Promise<AccessGrant[]> {
    const { data, error } = await this.client.rpc('manual_access_grants');
    if (error) throw new Error(`manual_access_grants: falha (${error.code})`);
    return (data ?? []).map((row) => ({
      id: row.id,
      memberEmail: row.member_email,
      reason: row.reason,
      validFrom: row.valid_from,
      validTo: row.valid_to,
      revokedAt: row.revoked_at,
    }));
  }
}

/** Dev sem Supabase: nada para listar; conceder falha alto em vez de fingir sucesso. */
export class UnconfiguredGrantStore implements GrantStore {
  async userIdByEmail(): Promise<string | null> {
    return null;
  }

  async create(): Promise<string> {
    throw new Error('Supabase não configurado: concessão indisponível');
  }

  async revoke(): Promise<boolean> {
    return false;
  }

  async list(): Promise<AccessGrant[]> {
    return [];
  }
}
