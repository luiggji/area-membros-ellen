/**
 * Classificação das chaves do Supabase sem expor o valor (CF-156). Serve para barrar a chave
 * secreta em variáveis públicas do web: ela ignora RLS e jamais pode chegar ao browser.
 *
 * Formatos: legado (JWT com `role` anon/service_role) e novo (`sb_publishable_` / `sb_secret_`).
 */
export type SupabaseKeyKind = 'public' | 'secret' | 'unknown';

// Global no browser e no Node; o `lib` deste pacote não inclui DOM.
declare function atob(data: string): string;

function jwtRole(key: string): unknown {
  const payload = key.split('.')[1];
  if (key.split('.').length !== 3 || !payload) return undefined;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return (JSON.parse(atob(base64)) as { role?: unknown }).role;
  } catch {
    return undefined;
  }
}

export function supabaseKeyKind(key: string): SupabaseKeyKind {
  if (key.startsWith('sb_secret_')) return 'secret';
  if (key.startsWith('sb_publishable_')) return 'public';
  const role = jwtRole(key);
  if (role === 'service_role') return 'secret';
  if (role === 'anon') return 'public';
  return 'unknown';
}
