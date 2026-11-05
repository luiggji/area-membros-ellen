import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { DependencyChecker } from '../application/ports';
import { DependencyCheck } from '../domain/health-report';

/** A trilha de auditoria (CF-161) está acessível para a API gravar. Não lê nem conta entradas. */
export class AuditLogChecker implements DependencyChecker {
  constructor(private readonly client: SupabaseAdmin) {}

  async check(): Promise<DependencyCheck> {
    // GET com limit 0, sem `head: true`: o HEAD não traz corpo e o erro de tabela ausente se perde
    // (falso "saudável", visto antes da migration chegar ao cloud).
    const { error } = await this.client.from('audit_logs').select('id').limit(0);
    return { name: 'audit_log', healthy: !error };
  }
}
