import { Role, roleSchema } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { AccessTokenVerifier, RoleRepository } from '../application/ports';

/** `getUser(token)` valida o JWT no Auth (assinatura, expiração e sessão), não só decodifica. */
export class SupabaseAccessTokenVerifier implements AccessTokenVerifier {
  constructor(private readonly client: SupabaseAdmin) {}

  async verify(token: string): Promise<string | null> {
    const { data, error } = await this.client.auth.getUser(token);
    return error || !data.user ? null : data.user.id;
  }
}

export class SupabaseRoleRepository implements RoleRepository {
  constructor(private readonly client: SupabaseAdmin) {}

  async rolesOf(userId: string): Promise<Role[]> {
    const { data, error } = await this.client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    if (error) throw new Error(`user_roles: falha ao ler papéis (${error.code})`);
    // Papel fora do catálogo é ignorado em vez de virar permissão por engano.
    return data.flatMap(({ role }) => {
      const parsed = roleSchema.safeParse(role);
      return parsed.success ? [parsed.data] : [];
    });
  }
}

/** Dev sem Supabase: ninguém autentica (rotas protegidas respondem 401). */
export class UnconfiguredAccessTokenVerifier implements AccessTokenVerifier {
  async verify(): Promise<string | null> {
    return null;
  }
}

export class UnconfiguredRoleRepository implements RoleRepository {
  async rolesOf(): Promise<Role[]> {
    return [];
  }
}
