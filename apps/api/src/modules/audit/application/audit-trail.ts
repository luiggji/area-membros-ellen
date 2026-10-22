import { Inject, Injectable } from '@nestjs/common';

import { AuditEntryInput, createAuditEntry } from '../domain/audit-entry';
import { AUDIT_LOG, AuditLog } from './ports';

/**
 * Helper que os módulos injetam para auditar ações críticas (preço, concessão manual, check-in
 * manual, moderação, papéis…). Valida e redige antes de gravar.
 *
 * Uso: `await this.audit.record({ actorId, actorRole: 'owner', action: 'price_version.created',
 * targetType: 'price_version', targetId: id, after })`.
 */
@Injectable()
export class AuditTrail {
  constructor(@Inject(AUDIT_LOG) private readonly log: AuditLog) {}

  async record(input: AuditEntryInput): Promise<void> {
    await this.log.append(createAuditEntry(input));
  }
}
