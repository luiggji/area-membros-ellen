import { describe, expect, it } from '@jest/globals';

import { createAuditEntry, InvalidAuditEntryError, REDACTED, redact } from './audit-entry';

const base = {
  actorId: '00000000-0000-0000-0000-000000000001',
  actorRole: 'owner' as const,
  action: 'price_version.created',
  targetType: 'price_version',
};

describe('redact', () => {
  it('redige PII em profundidade e mantém a chave para mostrar que mudou', () => {
    const snapshot = {
      amount_cents: 8900,
      buyer: { email: 'fulana@teste.local', cpf: '00000000000', name: 'Fulana' },
      contacts: [{ phone: '+55 11 90000-0000' }],
      access_token: 'abc',
    };
    expect(redact(snapshot)).toEqual({
      amount_cents: 8900,
      buyer: { email: REDACTED, cpf: REDACTED, name: 'Fulana' },
      contacts: [{ phone: REDACTED }],
      access_token: REDACTED,
    });
  });

  it('não altera o objeto original', () => {
    const original = { email: 'x@teste.local' };
    redact(original);
    expect(original.email).toBe('x@teste.local');
  });
});

describe('createAuditEntry', () => {
  it('normaliza ausentes para null e redige before/after', () => {
    const entry = createAuditEntry({
      ...base,
      before: { senha: 'velha', plan: 'monthly' },
      after: { senha: 'nova', plan: 'annual' },
    });
    expect(entry).toEqual({
      ...base,
      targetId: null,
      before: { senha: REDACTED, plan: 'monthly' },
      after: { senha: REDACTED, plan: 'annual' },
      correlationId: null,
    });
  });

  it('recusa action fora de <recurso>.<verbo> e targetType inválido', () => {
    expect(() => createAuditEntry({ ...base, action: 'Preço alterado' })).toThrow(
      InvalidAuditEntryError,
    );
    expect(() => createAuditEntry({ ...base, action: 'created' })).toThrow(InvalidAuditEntryError);
    expect(() => createAuditEntry({ ...base, targetType: 'Price-Version' })).toThrow(
      InvalidAuditEntryError,
    );
  });
});
