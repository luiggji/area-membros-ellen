import { describe, expect, it } from 'vitest';

import { can, PERMISSIONS, permissionsFor } from '../src/permissions.js';

describe('matriz de permissões (critérios de aceite do CF-032)', () => {
  it('comercial não edita preços nem papéis, nem vê financeiro ou conteúdo editorial', () => {
    for (const denied of [
      'prices.manage',
      'roles.manage',
      'finance.read',
      'content.manage',
    ] as const) {
      expect(can(['commercial'], denied), denied).toBe(false);
    }
  });

  it('comercial atende inscrições e faz check-in', () => {
    expect(can(['commercial'], 'tickets.support')).toBe(true);
    expect(can(['commercial'], 'checkin.perform')).toBe(true);
  });

  it('técnico não tem acesso financeiro por padrão e não herda o owner', () => {
    for (const denied of [
      'finance.read',
      'refunds.manage',
      'prices.manage',
      'roles.manage',
    ] as const) {
      expect(can(['tech'], denied), denied).toBe(false);
    }
    expect(can(['tech'], 'tech.config')).toBe(true);
  });

  it('owner gerencia o negócio inteiro', () => {
    for (const allowed of [
      'prices.manage',
      'roles.manage',
      'finance.read',
      'content.manage',
    ] as const) {
      expect(can(['owner'], allowed), allowed).toBe(true);
    }
  });

  it('só o owner concede acesso pago manualmente (CF-048)', () => {
    expect(can(['owner'], 'access.grant')).toBe(true);
    for (const role of ['commercial', 'tech', 'member'] as const) {
      expect(can([role], 'access.grant'), role).toBe(false);
    }
  });

  it('membro não tem nenhuma permissão administrativa', () => {
    expect(permissionsFor(['member'])).toEqual([]);
    expect(can(['member'], 'admin.access')).toBe(false);
  });

  it('papéis somam permissões sem repetir', () => {
    const permissions = permissionsFor(['commercial', 'tech']);
    expect(new Set(permissions).size).toBe(permissions.length);
    expect(permissions).toEqual(
      expect.arrayContaining(['admin.access', 'tickets.support', 'checkin.perform', 'tech.config']),
    );
  });

  it('nenhum papel tem permissão fora do catálogo', () => {
    const all = permissionsFor(['owner', 'commercial', 'tech', 'member']);
    expect(all.every((permission) => (PERMISSIONS as readonly string[]).includes(permission))).toBe(
      true,
    );
  });
});
