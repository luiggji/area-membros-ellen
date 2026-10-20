import { describe, expect, it } from 'vitest';

import { checkEnvironmentIsolation, supabaseProjectRef } from '../src/environment.js';

const PROD = 'prodref123';

describe('supabaseProjectRef', () => {
  it('extrai o ref do projeto cloud e reconhece o banco local', () => {
    expect(supabaseProjectRef('https://abcxyz.supabase.co')).toBe('abcxyz');
    expect(supabaseProjectRef('http://127.0.0.1:54321')).toBe('local');
    expect(supabaseProjectRef('http://localhost:54321')).toBe('local');
  });
});

describe('checkEnvironmentIsolation', () => {
  it('dev pode rodar sem banco enquanto a hospedagem não é escolhida (P-014)', () => {
    expect(checkEnvironmentIsolation({ appEnv: 'development' })).toEqual({
      status: 'not-configured',
    });
  });

  it('staging e produção exigem banco próprio', () => {
    expect(checkEnvironmentIsolation({ appEnv: 'staging' }).status).toBe('violation');
    expect(checkEnvironmentIsolation({ appEnv: 'production' }).status).toBe('violation');
  });

  it('staging e dev nunca apontam para o banco de produção', () => {
    for (const appEnv of ['development', 'staging'] as const) {
      const result = checkEnvironmentIsolation({
        appEnv,
        supabaseUrl: `https://${PROD}.supabase.co`,
        productionProjectRef: PROD,
      });
      expect(result).toEqual({
        status: 'violation',
        reason: `${appEnv} está apontando para o banco de produção`,
      });
    }
  });

  it('produção não usa banco local nem projeto diferente do registrado', () => {
    expect(
      checkEnvironmentIsolation({ appEnv: 'production', supabaseUrl: 'http://127.0.0.1:54321' })
        .status,
    ).toBe('violation');
    expect(
      checkEnvironmentIsolation({
        appEnv: 'production',
        supabaseUrl: 'https://outro.supabase.co',
        productionProjectRef: PROD,
      }).status,
    ).toBe('violation');
  });

  it('aceita cada ambiente no seu próprio projeto', () => {
    expect(
      checkEnvironmentIsolation({
        appEnv: 'staging',
        supabaseUrl: 'https://stagingref.supabase.co',
        productionProjectRef: PROD,
      }),
    ).toEqual({ status: 'ok', projectRef: 'stagingref' });
    expect(
      checkEnvironmentIsolation({
        appEnv: 'production',
        supabaseUrl: `https://${PROD}.supabase.co`,
        productionProjectRef: PROD,
      }),
    ).toEqual({ status: 'ok', projectRef: PROD });
  });
});
