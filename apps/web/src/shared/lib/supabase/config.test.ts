import { describe, expect, it } from 'vitest';

import { requireSupabasePublicConfig, supabaseCookieOptions, supabasePublicConfig } from './config';

const configured = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_ficticia',
};

describe('supabasePublicConfig', () => {
  it('devolve URL e chave pública quando as duas estão preenchidas', () => {
    expect(supabasePublicConfig(configured)).toEqual({
      url: configured.NEXT_PUBLIC_SUPABASE_URL,
      publicKey: configured.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  });

  it('devolve null quando falta qualquer uma (dev sem banco)', () => {
    expect(supabasePublicConfig({ ...configured, NEXT_PUBLIC_SUPABASE_URL: undefined })).toBeNull();
    expect(
      supabasePublicConfig({ ...configured, NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined }),
    ).toBeNull();
  });

  it('require falha com mensagem clara, sem ecoar valores', () => {
    expect(() =>
      requireSupabasePublicConfig({ ...configured, NEXT_PUBLIC_SUPABASE_URL: undefined }),
    ).toThrow(/Supabase não configurado/);
  });
});

describe('supabaseCookieOptions', () => {
  it('marca secure em produção e mantém sameSite=lax sempre', () => {
    expect(supabaseCookieOptions(true)).toEqual({ path: '/', sameSite: 'lax', secure: true });
    expect(supabaseCookieOptions(false).secure).toBe(false);
  });
});
