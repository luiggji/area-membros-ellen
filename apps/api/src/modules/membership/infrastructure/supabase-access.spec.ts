import { describe, expect, it } from '@jest/globals';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { SupabaseAccessReader } from './supabase-access';

function clientReturning(result: { data: unknown; error: unknown }) {
  const calls: unknown[][] = [];
  const client = {
    rpc: async (...args: unknown[]) => {
      calls.push(args);
      return result;
    },
  } as unknown as SupabaseAdmin;
  return { client, calls };
}

describe('SupabaseAccessReader (CF-046)', () => {
  it('consulta access_of_user com a pessoa e o escopo, e mapeia a linha', async () => {
    const { client, calls } = clientReturning({
      data: [{ source: 'manual', subscription_status: null, valid_until: '2026-12-31T00:00:00Z' }],
      error: null,
    });
    await expect(new SupabaseAccessReader(client).accessOf('u-1', 'caixa_forte')).resolves.toEqual({
      source: 'manual',
      subscriptionStatus: null,
      validUntil: '2026-12-31T00:00:00Z',
    });
    expect(calls).toEqual([['access_of_user', { p_user: 'u-1', p_scope: 'caixa_forte' }]]);
  });

  it('sem linha ou com origem desconhecida: sem acesso', async () => {
    const empty = clientReturning({ data: [], error: null }).client;
    const odd = clientReturning({
      data: [{ source: 'outra', subscription_status: null, valid_until: null }],
      error: null,
    }).client;
    await expect(
      new SupabaseAccessReader(empty).accessOf('u-1', 'caixa_forte'),
    ).resolves.toBeNull();
    await expect(new SupabaseAccessReader(odd).accessOf('u-1', 'caixa_forte')).resolves.toBeNull();
  });

  it('erro do banco falha alto (vira 500, nunca acesso liberado)', async () => {
    const { client } = clientReturning({ data: null, error: { code: '42501' } });
    await expect(new SupabaseAccessReader(client).accessOf('u-1', 'caixa_forte')).rejects.toThrow(
      'access_of_user',
    );
  });
});
