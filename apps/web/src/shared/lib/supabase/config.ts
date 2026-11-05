import type { PublicEnv } from '@/shared/config/env';

/** URL e chave pública (anon/publishable) do Supabase deste ambiente. Nunca a service_role. */
export interface SupabasePublicConfig {
  url: string;
  publicKey: string;
}

type SupabaseEnv = Pick<PublicEnv, 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'>;

/** `null` enquanto o ambiente não tem Supabase: dev pode rodar sem banco (CF-012). */
export function supabasePublicConfig(env: SupabaseEnv): SupabasePublicConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && publicKey ? { url, publicKey } : null;
}

/**
 * Cookies da sessão (CF-152): `secure` fora de dev (o padrão do @supabase/ssr não marca) e
 * `sameSite=lax` contra CSRF. Não dá para ser `httpOnly`: o cliente de browser lê a sessão.
 */
export function supabaseCookieOptions(isProduction: boolean) {
  return { path: '/', sameSite: 'lax', secure: isProduction } as const;
}

export function requireSupabasePublicConfig(env: SupabaseEnv): SupabasePublicConfig {
  const config = supabasePublicConfig(env);
  if (!config) {
    throw new Error(
      'Supabase não configurado: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  return config;
}
