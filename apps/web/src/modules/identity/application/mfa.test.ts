import { describe, expect, it } from 'vitest';

import { confirmCode, MFA_MESSAGES, type MfaGateway, startEnrollment } from './mfa-use-cases';

const FACTOR = '5f0e8c3a-2b1d-4c6e-9a7f-0d1e2f3a4b5c';

function fakeMfa({ enroll = true, valid = true } = {}) {
  const calls: string[] = [];
  const mfa: MfaGateway = {
    removePendingTotp: async () => {
      calls.push('remove');
    },
    enrollTotp: async () => {
      calls.push('enroll');
      return enroll
        ? { factorId: FACTOR, qrCode: 'data:image/svg+xml;utf8,<svg/>', secret: 'ABC' }
        : null;
    },
    verify: async (factorId, code) => {
      calls.push(`verify:${factorId}:${code}`);
      return valid;
    },
  };
  return { mfa, calls };
}

describe('cadastro do MFA', () => {
  it('limpa cadastros abandonados antes de gerar um novo QR', async () => {
    const { mfa, calls } = fakeMfa();
    expect(await startEnrollment(mfa)).toEqual({
      status: 'enrolling',
      factorId: FACTOR,
      qrCode: 'data:image/svg+xml;utf8,<svg/>',
      secret: 'ABC',
    });
    expect(calls).toEqual(['remove', 'enroll']);
  });

  it('falha ao gerar vira mensagem clara', async () => {
    expect(await startEnrollment(fakeMfa({ enroll: false }).mfa)).toEqual({
      status: 'error',
      message: MFA_MESSAGES.enrollFailed,
    });
  });
});

describe('verificação do código', () => {
  it('código certo leva ao painel', async () => {
    const { mfa, calls } = fakeMfa();
    expect(await confirmCode({ factorId: FACTOR, code: '123 456' }, mfa)).toEqual({
      status: 'redirect',
      to: '/admin',
    });
    expect(calls).toEqual([`verify:${FACTOR}:123456`]);
  });

  it('código errado vira mensagem, sem devolver chave nem QR', async () => {
    const result = await confirmCode(
      { factorId: FACTOR, code: '000000' },
      fakeMfa({ valid: false }).mfa,
    );
    expect(result).toEqual({ status: 'error', message: MFA_MESSAGES.invalidCode });
  });

  it('código malformado ou fator inválido nem chega ao Auth', async () => {
    const { mfa, calls } = fakeMfa();
    expect(await confirmCode({ factorId: FACTOR, code: '12ab56' }, mfa)).toMatchObject({
      status: 'error',
    });
    expect(await confirmCode({ factorId: 'x', code: '123456' }, mfa)).toMatchObject({
      status: 'error',
    });
    expect(calls).toEqual([]);
  });
});
