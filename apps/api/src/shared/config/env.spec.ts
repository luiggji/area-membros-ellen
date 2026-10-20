import { describe, expect, it } from '@jest/globals';

import { validateEnv } from './env';

describe('validateEnv (CF-012)', () => {
  it('sobe em dev sem Supabase enquanto a hospedagem não é escolhida', () => {
    const env = validateEnv({});
    expect(env.APP_ENV).toBe('development');
    expect(env.SUPABASE_URL).toBeUndefined();
  });

  it('trata variável vazia do .env como ausente', () => {
    expect(validateEnv({ SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' }).SUPABASE_URL).toBe(
      undefined,
    );
  });

  it('recusa staging sem banco próprio', () => {
    expect(() => validateEnv({ APP_ENV: 'staging' })).toThrow(/staging exige SUPABASE_URL/);
  });

  it('recusa staging apontando para o banco de produção', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'staging',
        SUPABASE_URL: 'https://prodref.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'chave-de-teste',
        SUPABASE_PRODUCTION_REF: 'prodref',
      }),
    ).toThrow(/apontando para o banco de produção/);
  });

  it('exige a chave de serviço fora de dev', () => {
    expect(() =>
      validateEnv({ APP_ENV: 'staging', SUPABASE_URL: 'https://stagingref.supabase.co' }),
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('aceita staging no próprio projeto', () => {
    const env = validateEnv({
      APP_ENV: 'staging',
      SUPABASE_URL: 'https://stagingref.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'chave-de-teste',
      SUPABASE_PRODUCTION_REF: 'prodref',
    });
    expect(env.APP_ENV).toBe('staging');
  });
});
