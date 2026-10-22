import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { DependencyChecker } from '../application/ports';
import { DependencyCheck } from '../domain/health-report';

/** A trilha de auditoria (CF-161) está acessível para a API gravar. Não lê nem conta entradas. */
export class AuditLogChecker implements DependencyChecker {
  constructor(private readonly client: SupabaseAdmin) {}

  async check(): Promise<DependencyCheck> {
    const { error } = await this.client.from('audit_logs').select('id', { head: true }).limit(1);
    return { name: 'audit_log', healthy: !error };
  }
}
