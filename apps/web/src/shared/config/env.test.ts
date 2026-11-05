import { describe, expect, it } from 'vitest';

import { parsePublicEnv } from './env';

describe('parsePublicEnv', () => {
  it('aplica defaults locais quando nada é informado', () => {
    expect(parsePublicEnv({}).NEXT_PUBLIC_API_URL).toBe('http://localhost:4000/api/v1');
  });

  it('rejeita URL inválida', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_URL: 'nao-e-url' })).toThrow();
  });

  it('aceita a chave pública do Supabase', () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_ficticia' });
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('sb_publishable_ficticia');
  });

  it('recusa a chave secreta do Supabase em variável pública, sem ecoar o valor', () => {
    const parse = () => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_secret_ficticia' });
    expect(parse).toThrow(/nunca vai para o browser/);
    expect(parse).not.toThrow(/sb_secret_ficticia/);
  });
});
