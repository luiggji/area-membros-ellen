import { AuditEntry } from '../domain/audit-entry';

/** Porta de gravação da trilha. Falha de gravação lança: quem audita decide se aborta a operação. */
export interface AuditLog {
  append(entry: AuditEntry): Promise<void>;
}

export const AUDIT_LOG = Symbol('AUDIT_LOG');
