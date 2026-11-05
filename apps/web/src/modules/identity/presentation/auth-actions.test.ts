import { beforeEach, describe, expect, it, vi } from 'vitest';

// As 5 actions do acesso num ambiente sem Supabase (CF-012): erro honesto, nunca 500 (#148).
const state = vi.hoisted(() => ({
  env: {} as Record<string, string | undefined>,
  createClient: vi.fn(),
}));

vi.mock('@/shared/config/env', () => ({ publicEnv: state.env }));
vi.mock('@/shared/lib/supabase/server', () => ({ createSupabaseServerClient: state.createClient }));
vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));

const { AUTH_MESSAGES } = await import('../application/auth-use-cases');
const {
  requestPasswordResetAction,
  signInAction,
  signOutAction,
  signUpAction,
  updatePasswordAction,
} = await import('./auth-actions');

// Senha fictícia montada em tempo de execução: literal parecido com senha dispara o gitleaks.
const strong = 'Aa1'.repeat(4);
const idle = { status: 'idle' } as const;

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  state.createClient.mockReset();
  state.env.NEXT_PUBLIC_APP_URL = 'https://app.test';
  state.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
  state.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;
});

describe('sem Supabase configurado', () => {
  it('entrar devolve erro honesto e nem tenta criar o cliente', async () => {
    const result = await signInAction(idle, form({ email: 'ana@teste.local', password: strong }));
    expect(result).toMatchObject({ status: 'error', message: AUTH_MESSAGES.unavailable });
    expect(state.createClient).not.toHaveBeenCalled();
  });

  it('cadastrar não promete e-mail de confirmação', async () => {
    const result = await signUpAction(
      idle,
      form({ name: 'Ana', email: 'ana@teste.local', password: strong }),
    );
    expect(result).toMatchObject({ status: 'error', message: AUTH_MESSAGES.unavailable });
  });

  it('recuperar senha não diz que enviou o link', async () => {
    const result = await requestPasswordResetAction(idle, form({ email: 'ana@teste.local' }));
    expect(result).toMatchObject({ status: 'error', message: AUTH_MESSAGES.unavailable });
  });

  it('nova senha não leva para a área privada', async () => {
    const result = await updatePasswordAction(idle, form({ password: strong, confirm: strong }));
    expect(result).toMatchObject({ status: 'error', message: AUTH_MESSAGES.unavailable });
  });

  it('sair volta ao login mesmo sem sessão para encerrar', async () => {
    await expect(signOutAction()).rejects.toThrow('redirect:/entrar?saiu=1');
  });

  it('a validação por campo continua acontecendo antes de tudo', async () => {
    const result = await signInAction(idle, form({ email: 'nao-e-email', password: '' }));
    expect(result).toMatchObject({ status: 'error' });
    expect(result).not.toMatchObject({ message: AUTH_MESSAGES.unavailable });
  });

  it('nenhuma action reexibe a senha digitada', async () => {
    const results = [
      await signInAction(idle, form({ email: 'ana@teste.local', password: strong })),
      await signUpAction(idle, form({ name: 'Ana', email: 'ana@teste.local', password: strong })),
      await updatePasswordAction(idle, form({ password: strong, confirm: strong })),
    ];
    expect(JSON.stringify(results)).not.toContain(strong);
  });
});

describe('com Supabase configurado, o caminho normal segue igual', () => {
  beforeEach(() => {
    state.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefghijklmnopqrst.supabase.co';
    state.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_ficticia';
  });

  it('entra e vai para a área privada', async () => {
    state.createClient.mockResolvedValue({
      auth: { signInWithPassword: async () => ({ error: null }) },
    });
    await expect(
      signInAction(idle, form({ email: 'ana@teste.local', password: strong })),
    ).rejects.toThrow('redirect:/app');
    expect(state.createClient).toHaveBeenCalledTimes(1);
  });

  it('credencial errada continua com a mensagem do Auth', async () => {
    state.createClient.mockResolvedValue({
      auth: { signInWithPassword: async () => ({ error: { code: 'invalid_credentials' } }) },
    });
    const result = await signInAction(idle, form({ email: 'ana@teste.local', password: strong }));
    expect(result).toMatchObject({ status: 'error', message: AUTH_MESSAGES.invalidCredentials });
  });
});
