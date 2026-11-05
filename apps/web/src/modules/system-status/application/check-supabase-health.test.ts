import { describe, expect, it } from 'vitest';

import type { FetchLike } from './check-api-health';
import { checkSupabaseHealth } from './check-supabase-health';

const config = {
  url: 'https://abcdefghijklmnopqrst.supabase.co/',
  publicKey: 'sb_publishable_ficticia',
};

const respondWith =
  (body: unknown, status = 200): FetchLike =>
  async () =>
    new Response(JSON.stringify(body), { status });

let clock = 0;
const fakeNow = () => (clock += 25);

describe('checkSupabaseHealth', () => {
  it('retorna ok com a latência e a versão do Auth', async () => {
    const result = await checkSupabaseHealth(
      config,
      respondWith({ version: 'v2.180.0', name: 'GoTrue' }),
      fakeNow,
    );
    expect(result).toEqual({ state: 'ok', latencyMs: 25, authVersion: 'v2.180.0' });
  });

  it('chama <url>/auth/v1/health com a chave pública no header apikey', async () => {
    let called: { url: string; apikey?: string } = { url: '' };
    await checkSupabaseHealth(
      config,
      async (url, init) => {
        called = { url, apikey: new Headers(init.headers).get('apikey') ?? undefined };
        return new Response('{}');
      },
      fakeNow,
    );
    expect(called).toEqual({
      url: 'https://abcdefghijklmnopqrst.supabase.co/auth/v1/health',
      apikey: 'sb_publishable_ficticia',
    });
  });

  it('acusa chave recusada (401) sem expor o valor', async () => {
    const result = await checkSupabaseHealth(config, respondWith({}, 401), fakeNow);
    expect(result).toMatchObject({
      state: 'invalid',
      detail: 'chave pública recusada pelo projeto',
    });
    expect(JSON.stringify(result)).not.toContain(config.publicKey);
  });

  it('acusa outros erros HTTP', async () => {
    const result = await checkSupabaseHealth(config, respondWith({}, 503), fakeNow);
    expect(result).toMatchObject({ state: 'invalid', detail: 'HTTP 503' });
  });

  it('aceita corpo fora do formato esperado, só sem versão', async () => {
    const result = await checkSupabaseHealth(config, async () => new Response('ok'), fakeNow);
    expect(result).toEqual({ state: 'ok', latencyMs: 25 });
  });

  it('retorna down quando a rede falha', async () => {
    const result = await checkSupabaseHealth(
      config,
      async () => {
        throw new TypeError('fetch failed');
      },
      fakeNow,
    );
    expect(result).toEqual({ state: 'down', detail: 'Supabase inacessível' });
  });

  it('retorna down com o tempo limite quando estoura o timeout', async () => {
    const result = await checkSupabaseHealth(
      config,
      async () => {
        throw new DOMException('timeout', 'TimeoutError');
      },
      fakeNow,
    );
    expect(result).toEqual({ state: 'down', detail: 'Sem resposta em 3s' });
  });
});
