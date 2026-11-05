import { describe, expect, it } from '@jest/globals';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { AuditLogChecker } from './audit-log.checker';

/** Cliente falso: registra a consulta e devolve o erro configurado. */
function fakeClient(error: { code: string } | null) {
  const calls: { table: string; columns: string; options?: unknown; limit?: number }[] = [];
  const client = {
    from: (table: string) => ({
      select: (columns: string, options?: unknown) => ({
        limit: async (limit: number) => {
          calls.push({ table, columns, options, limit });
          return { data: [], error };
        },
      }),
    }),
  };
  return { client: client as unknown as SupabaseAdmin, calls };
}

describe('AuditLogChecker', () => {
  it('saudável quando a tabela responde, sem ler nenhuma linha', async () => {
    const { client, calls } = fakeClient(null);
    expect(await new AuditLogChecker(client).check()).toEqual({
      name: 'audit_log',
      healthy: true,
    });
    expect(calls).toEqual([{ table: 'audit_logs', columns: 'id', options: undefined, limit: 0 }]);
  });

  it('indisponível quando a tabela não existe (ex.: migration não aplicada)', async () => {
    const { client } = fakeClient({ code: 'PGRST205' });
    expect((await new AuditLogChecker(client).check()).healthy).toBe(false);
  });

  it('não usa HEAD, que esconde o erro de tabela ausente', async () => {
    const { client, calls } = fakeClient(null);
    await new AuditLogChecker(client).check();
    expect(calls[0]?.options).toBeUndefined();
  });
});
