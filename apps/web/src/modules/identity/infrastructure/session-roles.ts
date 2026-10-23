import { type Role, roleSchema } from '@caixa-forte/contracts';

import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

/**
 * Papéis de quem está logado (CF-032), lidos com a sessão do próprio usuário: a RLS só devolve as
 * linhas dele. Serve para a UI refletir o acesso; quem autoriza é a API (`@RequirePermission`).
 */
export async function getSessionRoles(): Promise<Role[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('user_roles').select('role');
  if (error) return [];
  return data.flatMap(({ role }) => {
    const parsed = roleSchema.safeParse(role);
    return parsed.success ? [parsed.data] : [];
  });
}
