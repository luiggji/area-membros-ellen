import { describe, expect, it } from 'vitest';

import { environmentStatus } from './environment';

describe('environmentStatus', () => {
  it('sem configuração é dev sem banco (aguardando P-014)', () => {
    expect(environmentStatus({})).toEqual({
      appEnv: 'development',
      isolation: { status: 'not-configured' },
    });
  });

  it('APP_ENV desconhecido nunca vira produção', () => {
    expect(environmentStatus({ APP_ENV: 'prod' }).appEnv).toBe('development');
  });

  it('aponta a violação quando staging usa o banco de produção', () => {
    const status = environmentStatus({
      APP_ENV: 'staging',
      NEXT_PUBLIC_SUPABASE_URL: 'https://prodref.supabase.co',
      SUPABASE_PRODUCTION_REF: 'prodref',
    });
    expect(status.isolation.status).toBe('violation');
  });
});
