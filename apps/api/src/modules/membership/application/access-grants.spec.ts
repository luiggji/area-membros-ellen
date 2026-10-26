import { describe, expect, it } from '@jest/globals';

import { endOfDayInBrasilia, grantAccess, GrantStore } from './access-grants';

function fakeStore(known: Record<string, string> = { 'ana@teste.local': 'u-ana' }) {
  const created: unknown[] = [];
  const store: GrantStore = {
    userIdByEmail: async (email) => known[email] ?? null,
    create: async (input) => {
      created.push(input);
      return 'g-1';
    },
    revoke: async () => true,
    list: async () => [],
  };
  return { store, created };
}

const NOW = new Date('2026-10-26T15:00:00Z');
const request = (validUntil: string, email = 'ana@teste.local') => ({
  email,
  validUntil,
  reason: 'cortesia',
});

describe('concessão manual (CF-048)', () => {
  it('validade vale até 23:59 de Brasília do dia escolhido', () => {
    expect(endOfDayInBrasilia('2026-11-30').toISOString()).toBe('2026-12-01T02:59:59.999Z');
  });

  it('cria com quem concedeu, motivo e validade', async () => {
    const { store, created } = fakeStore();
    await expect(grantAccess(store, request('2026-11-30'), 'u-ellen', NOW)).resolves.toEqual({
      status: 'created',
      id: 'g-1',
    });
    expect(created).toEqual([
      {
        userId: 'u-ana',
        reason: 'cortesia',
        validTo: '2026-12-01T02:59:59.999Z',
        grantedBy: 'u-ellen',
      },
    ]);
  });

  it('data no passado não cria nada', async () => {
    const { store, created } = fakeStore();
    await expect(grantAccess(store, request('2026-10-25'), 'u-ellen', NOW)).resolves.toEqual({
      status: 'invalid_date',
    });
    expect(created).toEqual([]);
  });

  it('e-mail sem conta: avisa, sem criar', async () => {
    const { store, created } = fakeStore();
    await expect(
      grantAccess(store, request('2026-11-30', 'ninguem@teste.local'), 'u-ellen', NOW),
    ).resolves.toEqual({ status: 'member_not_found' });
    expect(created).toEqual([]);
  });
});
