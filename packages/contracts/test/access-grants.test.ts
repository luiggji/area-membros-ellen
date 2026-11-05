import { describe, expect, it } from 'vitest';

import { grantAccessRequestSchema } from '../src/access-grants.js';

describe('pedido de concessão manual (CF-048)', () => {
  it('normaliza o e-mail e exige motivo e data', () => {
    expect(
      grantAccessRequestSchema.parse({
        email: ' Membro@Teste.Local ',
        validUntil: '2026-12-31',
        reason: '  cortesia do lançamento ',
      }),
    ).toEqual({
      email: 'membro@teste.local',
      validUntil: '2026-12-31',
      reason: 'cortesia do lançamento',
    });
  });

  it('recusa motivo vazio, data inválida e e-mail inválido', () => {
    expect(
      grantAccessRequestSchema.safeParse({ email: 'x', validUntil: '2026-12-31', reason: 'ok!' })
        .success,
    ).toBe(false);
    expect(
      grantAccessRequestSchema.safeParse({
        email: 'a@b.co',
        validUntil: '31/12/2026',
        reason: 'ok!',
      }).success,
    ).toBe(false);
    expect(
      grantAccessRequestSchema.safeParse({
        email: 'a@b.co',
        validUntil: '2026-12-31',
        reason: '  ',
      }).success,
    ).toBe(false);
  });
});
