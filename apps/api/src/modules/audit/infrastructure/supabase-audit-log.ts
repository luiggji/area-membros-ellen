import { Json } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { AuditLog } from '../application/ports';
import { AuditEntry } from '../domain/audit-entry';

/** Grava em `public.audit_logs` com a service_role (a tabela é append-only no banco). */
export class SupabaseAuditLog implements AuditLog {
  constructor(private readonly client: SupabaseAdmin) {}

  async append(entry: AuditEntry): Promise<void> {
    const { error } = await this.client.from('audit_logs').insert({
      actor_id: entry.actorId,
      actor_role: entry.actorRole,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      before: entry.before as Json | null,
      after: entry.after as Json | null,
      correlation_id: entry.correlationId,
    });
    // Só o código do erro: a mensagem do banco pode ecoar valores.
    if (error) throw new Error(`audit_logs: falha ao gravar ${entry.action} (${error.code})`);
  }
}
