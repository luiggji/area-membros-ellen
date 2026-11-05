import { describe, expect, it } from '@jest/globals';

import { AuditEntry, REDACTED } from '../domain/audit-entry';
import { AuditTrail } from './audit-trail';
import { AuditLog } from './ports';

class FakeAuditLog implements AuditLog {
  readonly entries: AuditEntry[] = [];
  async append(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
}

describe('AuditTrail', () => {
  it('grava a entrada já validada e redigida', async () => {
    const log = new FakeAuditLog();
    await new AuditTrail(log).record({
      actorId: null,
      actorRole: 'system',
      action: 'webhook.received',
      targetType: 'webhook',
      after: { event: 'invoice.paid', customer_email: 'x@teste.local' },
    });
    expect(log.entries).toHaveLength(1);
    expect(log.entries[0]?.after).toEqual({ event: 'invoice.paid', customer_email: REDACTED });
  });

  it('não grava nada se a entrada for inválida', async () => {
    const log = new FakeAuditLog();
    await expect(
      new AuditTrail(log).record({
        actorId: null,
        actorRole: 'system',
        action: 'invalido',
        targetType: 'webhook',
      }),
    ).rejects.toThrow();
    expect(log.entries).toHaveLength(0);
  });

  it('propaga falha de gravação para quem audita decidir', async () => {
    const failing: AuditLog = {
      append: async () => {
        throw new Error('banco indisponível');
      },
    };
    await expect(
      new AuditTrail(failing).record({
        actorId: null,
        actorRole: 'system',
        action: 'webhook.received',
        targetType: 'webhook',
      }),
    ).rejects.toThrow('banco indisponível');
  });
});
