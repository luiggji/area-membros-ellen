import { describe, expect, it } from 'vitest';

import {
  GRANT_MESSAGES,
  type GrantApiResult,
  type GrantsApi,
  submitGrant,
} from './grant-use-cases';

function fakeApi(result: GrantApiResult) {
  const calls: unknown[] = [];
  const api: GrantsApi = {
    grant: async (body) => {
      calls.push(body);
      return result;
    },
  };
  return { api, calls };
}

const valid = { email: ' Ana@Teste.Local ', validUntil: '2099-12-31', reason: 'cortesia' };

describe('formulário de concessão (CF-048)', () => {
  it('envia o pedido normalizado e confirma', async () => {
    const { api, calls } = fakeApi({ ok: true });
    expect(await submitGrant(valid, api)).toEqual({
      status: 'success',
      message: 'Acesso concedido a ana@teste.local.',
    });
    expect(calls).toEqual([
      { email: 'ana@teste.local', validUntil: '2099-12-31', reason: 'cortesia' },
    ]);
  });

  it('campo inválido nem chega à API e mantém o que foi digitado', async () => {
    const { api, calls } = fakeApi({ ok: true });
    const state = await submitGrant({ ...valid, reason: '' }, api);
    expect(state).toMatchObject({ status: 'error', values: { email: ' Ana@Teste.Local ' } });
    expect(state.status === 'error' && state.fieldErrors?.reason).toBeTruthy();
    expect(calls).toEqual([]);
  });

  it('traduz as respostas da API', async () => {
    expect(await submitGrant(valid, fakeApi({ ok: false, status: 404 }).api)).toMatchObject({
      message: GRANT_MESSAGES.memberNotFound,
    });
    expect(await submitGrant(valid, fakeApi({ ok: false, status: 403 }).api)).toMatchObject({
      message: GRANT_MESSAGES.forbidden,
    });
    expect(
      await submitGrant(
        valid,
        fakeApi({
          ok: false,
          status: 400,
          fields: { validUntil: 'A validade precisa ser uma data futura.' },
        }).api,
      ),
    ).toMatchObject({ fieldErrors: { validUntil: 'A validade precisa ser uma data futura.' } });
  });
});
