import type { Database } from '@caixa-forte/contracts';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

import { supabaseCookieOptions, supabasePublicConfig } from './config';

export interface CookieToSet {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

/**
 * Renova a sessão no proxy (CF-030, padrão do @supabase/ssr): valida o usuário no Auth e devolve
 * os cookies novos. Os cookies também são gravados na requisição, para os Server Components da
 * mesma requisição já lerem a sessão renovada.
 */
export async function refreshSession(
  request: NextRequest,
): Promise<{ user: User | null; cookies: CookieToSet[] }> {
  const config = supabasePublicConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!config) return { user: null, cookies: [] };

  const cookies: CookieToSet[] = [];
  const supabase = createServerClient<Database>(config.url, config.publicKey, {
    cookieOptions: supabaseCookieOptions(process.env.NODE_ENV === 'production'),
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value, options } of toSet) {
          request.cookies.set(name, value);
          cookies.push({ name, value, options: options as Record<string, unknown> });
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  return { user: error ? null : data.user, cookies };
}
