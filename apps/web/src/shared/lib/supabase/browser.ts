import type { Database } from '@caixa-forte/contracts';
import { createBrowserClient } from '@supabase/ssr';

import { publicEnv } from '@/shared/config/env';

import { requireSupabasePublicConfig, supabaseCookieOptions } from './config';

/**
 * Cliente Supabase tipado para Client Components (CF-156). Só a chave pública, protegida por
 * RLS; o `env.ts` recusa a service_role nas variáveis públicas.
 */
export function createSupabaseBrowserClient() {
  const { url, publicKey } = requireSupabasePublicConfig(publicEnv);
  return createBrowserClient<Database>(url, publicKey, {
    cookieOptions: supabaseCookieOptions(process.env.NODE_ENV === 'production'),
  });
}
