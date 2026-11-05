import type { Database } from '@caixa-forte/contracts';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { publicEnv } from '@/shared/config/env';

import { requireSupabasePublicConfig, supabaseCookieOptions } from './config';

/**
 * Cliente Supabase tipado para Server Components, Server Actions e Route Handlers (CF-156).
 * Age como o usuário da sessão (cookies), sempre sob RLS: usa só a chave pública.
 */
export async function createSupabaseServerClient() {
  const { url, publicKey } = requireSupabasePublicConfig(publicEnv);
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publicKey, {
    cookieOptions: supabaseCookieOptions(process.env.NODE_ENV === 'production'),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component não grava cookie; a renovação da sessão fica no proxy do Auth (CF-030).
        }
      },
    },
  });
}
