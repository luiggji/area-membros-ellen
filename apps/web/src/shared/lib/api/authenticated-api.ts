import { publicEnv } from '@/shared/config/env';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

/**
 * Chamada à API (NestJS) em nome de quem está logado, só no servidor. O access token sai do
 * cookie da sessão e a API o valida no Auth a cada requisição (assinatura, sessão, `aal` e papéis):
 * a autorização é sempre dela. Sem sessão, devolve 401 sem chamar a rede. API fora do ar vira
 * 503, para a tela mostrar "tente de novo" em vez de cair na página de erro (#123).
 */
export async function callApi(path: string, init: RequestInit = {}): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) return new Response(null, { status: 401 });
  try {
    return await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
