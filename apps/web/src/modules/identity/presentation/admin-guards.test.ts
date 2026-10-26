import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminAccess } from '../domain/admin-access';

// A portaria das páginas, das actions e dos layouts do /admin, sem Supabase nem Next de verdade.
const state = vi.hoisted(() => ({
  access: 'allow' as AdminAccess,
  verify: vi.fn(),
  enroll: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
  notFound: () => {
    throw new Error('not_found');
  },
}));
vi.mock('../infrastructure/admin-gate', () => ({
  loadAdminGate: async () => ({
    access: state.access,
    user: null,
    roles: [],
    verifiedFactorId: null,
  }),
}));
vi.mock('@/shared/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({}) }));
vi.mock('../infrastructure/supabase-mfa', () => ({
  supabaseMfaGateway: () => ({
    removePendingTotp: async () => {},
    enrollTotp: state.enroll,
    verify: state.verify,
  }),
}));

const { requireAdminPanel, requireStaff } = await import('./admin-guards');
const { confirmCodeAction, startEnrollmentAction } = await import('./mfa-actions');

const FACTOR = '5f0e8c3a-2b1d-4c6e-9a7f-0d1e2f3a4b5c';
function codeForm() {
  const form = new FormData();
  form.set('factorId', FACTOR);
  form.set('code', '123456');
  return form;
}

beforeEach(() => {
  state.verify.mockReset().mockResolvedValue(true);
  state.enroll.mockReset().mockResolvedValue({ factorId: FACTOR, qrCode: 'qr', secret: 's' });
});

describe('páginas do painel (não dependem do layout)', () => {
  it.each([
    ['login', 'redirect:/entrar?next=/admin'],
    ['not_found', 'not_found'],
    ['enroll_mfa', 'redirect:/admin/mfa'],
    ['verify_mfa', 'redirect:/admin/mfa'],
  ] as const)('%s não passa', async (access, outcome) => {
    state.access = access;
    await expect(requireAdminPanel()).rejects.toThrow(outcome);
  });

  it('equipe com aal2 passa', async () => {
    state.access = 'allow';
    await expect(requireAdminPanel()).resolves.toMatchObject({ access: 'allow' });
  });

  it('tela do MFA: só a equipe, com ou sem segundo fator', async () => {
    state.access = 'not_found';
    await expect(requireStaff()).rejects.toThrow('not_found');
    state.access = 'verify_mfa';
    await expect(requireStaff()).resolves.toMatchObject({ access: 'verify_mfa' });
  });
});

describe('Server Actions do MFA (endpoints públicos)', () => {
  it('membro recebe 404 e não chega ao Auth', async () => {
    state.access = 'not_found';
    await expect(startEnrollmentAction()).rejects.toThrow('not_found');
    await expect(confirmCodeAction({ status: 'idle' }, codeForm())).rejects.toThrow('not_found');
    expect(state.enroll).not.toHaveBeenCalled();
    expect(state.verify).not.toHaveBeenCalled();
  });

  it('sem sessão vai ao login', async () => {
    state.access = 'login';
    await expect(startEnrollmentAction()).rejects.toThrow('redirect:/entrar?next=/admin');
  });

  it('quem já tem fator verificado (aal1) não cadastra outro', async () => {
    state.access = 'verify_mfa';
    expect(await startEnrollmentAction()).toMatchObject({ status: 'error' });
    expect(state.enroll).not.toHaveBeenCalled();
  });

  it('sessão já aal2 não verifica de novo', async () => {
    state.access = 'allow';
    await expect(confirmCodeAction({ status: 'idle' }, codeForm())).rejects.toThrow(
      'redirect:/admin',
    );
    expect(state.verify).not.toHaveBeenCalled();
  });

  it('equipe na verificação: código certo leva ao painel', async () => {
    state.access = 'verify_mfa';
    await expect(confirmCodeAction({ status: 'idle' }, codeForm())).rejects.toThrow(
      'redirect:/admin',
    );
    expect(state.verify).toHaveBeenCalledWith(FACTOR, '123456');
  });
});
