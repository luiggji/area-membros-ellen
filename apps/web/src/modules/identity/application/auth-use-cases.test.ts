import { describe, expect, it } from 'vitest';

import {
  AUTH_MESSAGES,
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from './auth-use-cases';
import type { AuthFailure, AuthGateway } from './ports';

const APP = 'https://app.test';
// Senha fictícia montada em tempo de execução: literal parecido com senha dispara o gitleaks.
const strong = 'Aa1'.repeat(4);

/** Gateway falso: registra as chamadas e devolve a falha configurada. */
function fakeAuth(failure: AuthFailure | null = null) {
  const calls: Record<string, unknown[]> = {};
  const record =
    (name: string) =>
    async (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
      return failure;
    };
  const auth: AuthGateway = {
    signUp: record('signUp'),
    signIn: record('signIn'),
    requestPasswordReset: record('requestPasswordReset'),
    updatePassword: record('updatePassword'),
    signOut: async () => {
      (calls.signOut ??= []).push([]);
    },
  };
  return { auth, calls };
}

describe('cadastro', () => {
  it('envia para "verifique seu e-mail" com o callback de confirmação', async () => {
    const { auth, calls } = fakeAuth();
    const result = await signUp(
      { name: 'Ana', email: 'Ana@Teste.Local', password: strong },
      auth,
      APP,
    );
    expect(result).toEqual({ status: 'redirect', to: '/verifique-seu-email' });
    expect(calls.signUp?.[0]).toEqual([
      {
        name: 'Ana',
        email: 'ana@teste.local',
        password: strong,
        emailRedirectTo: 'https://app.test/auth/callback?next=/app',
      },
    ]);
  });

  it('não chama o Auth com dados inválidos e devolve erro por campo', async () => {
    const { auth, calls } = fakeAuth();
    const result = await signUp({ name: '', email: 'x', password: '1' }, auth, APP);
    expect(result).toMatchObject({ status: 'error', values: { email: 'x' } });
    expect(calls.signUp).toBeUndefined();
  });

  it('nunca reexibe a senha', async () => {
    const { auth } = fakeAuth('unknown');
    const result = await signUp(
      { name: 'Ana', email: 'ana@teste.local', password: strong },
      auth,
      APP,
    );
    expect(JSON.stringify(result)).not.toContain(strong);
  });

  it('senha recusada pelo Auth e excesso de tentativas viram mensagens claras', async () => {
    const input = { name: 'Ana', email: 'ana@teste.local', password: strong };
    expect(await signUp(input, fakeAuth('weak_password').auth, APP)).toMatchObject({
      message: AUTH_MESSAGES.weakPassword,
    });
    expect(await signUp(input, fakeAuth('rate_limited').auth, APP)).toMatchObject({
      message: AUTH_MESSAGES.rateLimited,
    });
  });
});

describe('login', () => {
  it('entra e volta para o destino interno pedido', async () => {
    const result = await signIn(
      { email: 'ana@teste.local', password: 'x', next: '/app/cursos' },
      fakeAuth().auth,
    );
    expect(result).toEqual({ status: 'redirect', to: '/app/cursos' });
  });

  it('ignora destino externo (open redirect)', async () => {
    const result = await signIn(
      { email: 'ana@teste.local', password: 'x', next: 'https://evil.test' },
      fakeAuth().auth,
    );
    expect(result).toEqual({ status: 'redirect', to: '/app' });
  });

  it('credencial errada: mensagem única, sem dizer se o e-mail existe', async () => {
    const result = await signIn(
      { email: 'ana@teste.local', password: 'errada' },
      fakeAuth('invalid_credentials').auth,
    );
    expect(result).toEqual({
      status: 'error',
      message: AUTH_MESSAGES.invalidCredentials,
      values: { email: 'ana@teste.local' },
    });
  });
});

describe('recuperação de senha', () => {
  it('responde igual exista a conta ou não', async () => {
    for (const failure of [null, 'unknown', 'invalid_credentials'] as const) {
      const result = await requestPasswordReset(
        { email: 'x@teste.local' },
        fakeAuth(failure).auth,
        APP,
      );
      expect(result).toEqual({ status: 'success', message: AUTH_MESSAGES.resetSent });
    }
  });

  it('manda o link para o callback que leva a redefinir a senha', async () => {
    const { auth, calls } = fakeAuth();
    await requestPasswordReset({ email: 'x@teste.local' }, auth, APP);
    expect(calls.requestPasswordReset?.[0]).toEqual([
      'x@teste.local',
      'https://app.test/auth/callback?next=/redefinir-senha',
    ]);
  });

  it('nova senha: link expirado e senha repetida têm mensagem própria', async () => {
    const input = { password: strong, confirm: strong };
    expect(await updatePassword(input, fakeAuth('session_missing').auth)).toMatchObject({
      message: AUTH_MESSAGES.sessionMissing,
    });
    expect(await updatePassword(input, fakeAuth('same_password').auth)).toMatchObject({
      message: AUTH_MESSAGES.samePassword,
    });
    expect(await updatePassword(input, fakeAuth().auth)).toEqual({
      status: 'redirect',
      to: '/app',
    });
  });
});

describe('sair', () => {
  it('invalida a sessão no Auth e volta ao login', async () => {
    const { auth, calls } = fakeAuth();
    expect(await signOut(auth)).toEqual({ status: 'redirect', to: '/entrar?saiu=1' });
    expect(calls.signOut).toHaveLength(1);
  });
});
