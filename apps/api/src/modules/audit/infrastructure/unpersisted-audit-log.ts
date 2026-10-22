import { Logger } from '@nestjs/common';

import { AuditLog } from '../application/ports';
import { AuditEntry } from '../domain/audit-entry';

/**
 * Só em dev sem Supabase (CF-012): avisa no log que a entrada não foi persistida, sem
 * before/after. Staging e produção nunca chegam aqui: o env exige Supabase fora de dev.
 */
export class UnpersistedAuditLog implements AuditLog {
  private readonly logger = new Logger('AuditTrail');

  async append(entry: AuditEntry): Promise<void> {
    this.logger.warn(`não persistido (sem Supabase): ${entry.action} em ${entry.targetType}`);
  }
}
