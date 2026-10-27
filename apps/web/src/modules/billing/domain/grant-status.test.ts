import { describe, expect, it } from 'vitest';

import { grantStatus, parseTimestamp, todayInBrasilia } from './grant-status';

const NOW = new Date('2026-10-26T15:00:00Z');
const grant = (
  over: Partial<{ validFrom: string; validTo: string; revokedAt: string | null }>,
) => ({
  validFrom: '2026-10-01T00:00:00Z',
  validTo: '2026-11-30T00:00:00Z',
  revokedAt: null,
  ...over,
});

describe('situação da concessão (CF-048)', () => {
  it('ativa, revogada, expirada e programada', () => {
    expect(grantStatus(grant({}), NOW)).toBe('active');
    expect(grantStatus(grant({ revokedAt: '2026-10-20T00:00:00Z' }), NOW)).toBe('revoked');
    expect(grantStatus(grant({ validTo: '2026-10-25T00:00:00Z' }), NOW)).toBe('expired');
    expect(grantStatus(grant({ validFrom: '2026-10-30T00:00:00Z' }), NOW)).toBe('scheduled');
  });

  it('concessão recém-criada é ativa mesmo com relógio do banco um pouco à frente (#123)', () => {
    expect(grantStatus(grant({ validFrom: '2026-10-26T15:02:00Z' }), NOW)).toBe('active');
  });

  it('timestamp sem fuso é UTC, não hora local (#123)', () => {
    expect(parseTimestamp('2026-10-26T15:00:00.123456').toISOString()).toBe(
      '2026-10-26T15:00:00.123Z',
    );
    expect(parseTimestamp('2026-10-26 15:00:00+00').toISOString()).toBe('2026-10-26T15:00:00.000Z');
    expect(parseTimestamp('2026-10-26T12:00:00-03:00').toISOString()).toBe(
      '2026-10-26T15:00:00.000Z',
    );
    expect(grantStatus(grant({ validFrom: '2026-10-26T14:59:00' }), NOW)).toBe('active');
  });

  it('hoje no fuso de Brasília, mesmo quando em UTC já é amanhã', () => {
    expect(todayInBrasilia(new Date('2026-10-27T01:30:00Z'))).toBe('2026-10-26');
  });
});
