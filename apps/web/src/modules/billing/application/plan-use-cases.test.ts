import { describe, expect, it } from 'vitest';

import {
  CATALOG_MESSAGES,
  type CatalogApiResult,
  type PlansApi,
  submitCreatePlan,
  submitPublishPrice,
  submitUpdatePlan,
} from './plan-use-cases';

const PLAN = '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f';

function fakeApi(result: CatalogApiResult = { ok: true }) {
  const calls: unknown[][] = [];
  const api: PlansApi = {
    create: async (body) => {
      calls.push(['create', body]);
      return result;
    },
    update: async (id, body) => {
      calls.push(['update', id, body]);
      return result;
    },
    publishPrice: async (id, body) => {
      calls.push(['price', id, body]);
      return result;
    },
  };
  return { api, calls };
}

describe('preço novo pelo owner (CF-041)', () => {
  it('converte reais para centavos e confirma o que vale para novas vendas', async () => {
    const { api, calls } = fakeApi();
    const state = await submitPublishPrice(
      { planId: PLAN, interval: 'month', amount: '99,90' },
      api,
    );
    expect(state.status).toBe('success');
    expect(state.status === 'success' && state.message.replace(/\s/g, ' ')).toBe(
      'Novo preço mensal de R$ 99,90 publicado para novas vendas.',
    );
    expect(calls).toEqual([['price', PLAN, { interval: 'month', amountCents: 9990 }]]);
  });

  it('valor ilegível ou abaixo do mínimo não chega à API', async () => {
    const { api, calls } = fakeApi();
    expect(
      await submitPublishPrice({ planId: PLAN, interval: 'month', amount: '89.90' }, api),
    ).toMatchObject({
      status: 'error',
      fieldErrors: { amount: 'Informe o valor em reais, ex.: 89,90.' },
    });
    expect(
      await submitPublishPrice({ planId: PLAN, interval: 'month', amount: '0,50' }, api),
    ).toMatchObject({
      status: 'error',
      fieldErrors: { amount: 'O valor mínimo é R$ 1,00.' },
    });
    expect(calls).toEqual([]);
  });
});

describe('planos (CF-041)', () => {
  it('cria com código normalizado; código repetido vira mensagem clara', async () => {
    const ok = fakeApi();
    await submitCreatePlan({ code: 'Mentoria', name: 'Mentoria', description: '' }, ok.api);
    expect(ok.calls).toEqual([['create', { code: 'mentoria', name: 'Mentoria', description: '' }]]);
    expect(
      await submitCreatePlan(
        { code: 'caixa-forte', name: 'Outro', description: '' },
        fakeApi({ ok: false, status: 409 }).api,
      ),
    ).toMatchObject({ message: CATALOG_MESSAGES.codeTaken });
  });

  it('edita e desativa pelo checkbox; sessão sem MFA vira mensagem', async () => {
    const { api, calls } = fakeApi();
    await submitUpdatePlan({ planId: PLAN, name: 'Caixa Forte', description: '' }, api);
    expect(calls).toEqual([
      ['update', PLAN, { name: 'Caixa Forte', description: '', active: false }],
    ]);
    expect(
      await submitUpdatePlan(
        { planId: PLAN, name: 'Caixa Forte', description: '', active: 'on' },
        fakeApi({ ok: false, status: 403 }).api,
      ),
    ).toMatchObject({ message: CATALOG_MESSAGES.forbidden });
  });
});
