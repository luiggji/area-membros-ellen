import { describe, expect, it } from 'vitest';

import { adminAccess, isTotpCode } from './admin-access';

const base = {
  signedIn: true,
  roles: ['member'] as const,
  aal: 'aal1' as const,
  hasVerifiedFactor: false,
};

describe('adminAccess (critérios do CF-034)', () => {
  it('visitante vai para o login', () => {
    expect(adminAccess({ ...base, signedIn: false })).toBe('login');
  });

  it('membro não acessa: recebe 404, mesmo com MFA', () => {
    expect(adminAccess(base)).toBe('not_found');
    expect(adminAccess({ ...base, aal: 'aal2', hasVerifiedFactor: true })).toBe('not_found');
  });

  it('equipe sem fator cadastrado precisa configurar MFA', () => {
    for (const role of ['owner', 'commercial', 'tech'] as const) {
      expect(adminAccess({ ...base, roles: [role, 'member'] }), role).toBe('enroll_mfa');
    }
  });

  it('equipe com fator, mas sessão sem segundo fator, precisa verificar o código', () => {
    expect(adminAccess({ ...base, roles: ['owner'], hasVerifiedFactor: true })).toBe('verify_mfa');
  });

  it('equipe com segundo fator verificado na sessão entra', () => {
    expect(adminAccess({ ...base, roles: ['tech'], aal: 'aal2', hasVerifiedFactor: true })).toBe(
      'allow',
    );
  });
});

describe('isTotpCode', () => {
  it('aceita só 6 dígitos', () => {
    expect(isTotpCode('123456')).toBe(true);
    for (const value of ['12345', '1234567', '12345a', ' 123456', null, 123456]) {
      expect(isTotpCode(value), String(value)).toBe(false);
    }
  });
});
