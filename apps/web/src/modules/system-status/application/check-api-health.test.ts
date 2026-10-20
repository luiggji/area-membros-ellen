import { describe, expect, it } from 'vitest';

import { checkApiHealth, type FetchLike } from './check-api-health';

const healthy = {
  status: 'ok',
  service: 'caixa-forte-api',
  version: '0.0.0',
  timestamp: '2026-10-20T12:00:00.000Z',
};

const respondWith =
  (body: unknown, status = 200): FetchLike =>
  async () =>
    new Response(JSON.stringify(body), { status });

let clock = 0;
const fakeNow = () => (clock += 40);

describe('checkApiHealth', () => {
  it('retorna ok com o relatório e a latência quando a API responde no contrato', async () => {
    const result = await checkApiHealth('http://api/api/v1/', respondWith(healthy), fakeNow);
    expect(result).toEqual({ state: 'ok', latencyMs: 40, report: healthy });
  });

  it('chama exatamente <base>/health, sem barra dupla', async () => {
    let called = '';
    await checkApiHealth(
      'http://api/api/v1/',
      async (url) => {
        called = url;
        return new Response(JSON.stringify(healthy));
      },
      fakeNow,
    );
    expect(called).toBe('http://api/api/v1/health');
  });

  it('propaga degraded informado pela API', async () => {
    const result = await checkApiHealth(
      'http://api',
      respondWith({ ...healthy, status: 'degraded' }),
    );
    expect(result.state).toBe('degraded');
  });

  it('marca invalid para HTTP de erro ou resposta fora do contrato', async () => {
    expect((await checkApiHealth('http://api', respondWith({}, 500))).state).toBe('invalid');
    expect((await checkApiHealth('http://api', respondWith({ status: 'ok' }))).state).toBe(
      'invalid',
    );
  });

  it('marca down quando a API não responde', async () => {
    const result = await checkApiHealth('http://api', async () => {
      throw new TypeError('fetch failed');
    });
    expect(result).toEqual({ state: 'down', detail: 'API inacessível' });
  });
});
