import { beforeEach, describe, expect, it, vi } from 'vitest';

// Rota pública e sem sessão: num ambiente sem Supabase ela respondia 500 (#148).
const state = vi.hoisted(() => ({
  env: {} as Record<string, string | undefined>,
  createClient: vi.fn(),
}));

vi.mock('@/shared/config/env', () => ({ publicEnv: state.env }));
vi.mock('@/shared/lib/supabase/server', () => ({ createSupabaseServerClient: state.createClient }));

const { GET } = await import('./route');

const callback = (query: string) => GET(new Request(`https://app.test/auth/callback${query}`));
const LOGIN_INDISPONIVEL = 'https://app.test/entrar?erro=indisponivel';

beforeEach(() => {
  state.createClient.mockReset();
  state.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
  state.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
});

describe('sem Supabase configurado', () => {
  it('link de confirmação volta ao login com aviso, sem estourar', async () => {
    const response = await callback('?code=abc&next=/app/cursos');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(LOGIN_INDISPONIVEL);
    expect(state.createClient).not.toHaveBeenCalled();
  });

  it('o mesmo sem nenhum parâmetro', async () => {
    const response = await callback('');
    expect(response.headers.get('location')).toBe(LOGIN_INDISPONIVEL);
  });

  it('o aviso vai para um destino interno, mesmo com next externo', async () => {
    const response = await callback('?code=abc&next=https://evil.test');
    expect(response.headers.get('location')).toBe(LOGIN_INDISPONIVEL);
  });
});

describe('com Supabase configurado', () => {
  beforeEach(() => {
    state.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefghijklmnopqrst.supabase.co';
    state.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_ficticia';
  });

  it('código válido segue para o destino interno pedido', async () => {
    state.createClient.mockResolvedValue({
      auth: { exchangeCodeForSession: async () => ({ error: null }) },
    });
    const response = await callback('?code=abc&next=/app/cursos');
    expect(response.headers.get('location')).toBe('https://app.test/app/cursos');
  });

  it('código inválido volta ao login como link expirado', async () => {
    state.createClient.mockResolvedValue({
      auth: { exchangeCodeForSession: async () => ({ error: new Error('invalido') }) },
    });
    const response = await callback('?code=abc');
    expect(response.headers.get('location')).toBe('https://app.test/entrar?erro=link');
  });
});
