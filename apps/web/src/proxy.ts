import { type NextRequest, NextResponse } from 'next/server';

import { type CookieToSet, refreshSession } from '@/shared/lib/supabase/proxy-session';
import { buildCsp, createNonce, isPrivatePath } from '@/shared/security/csp';

function withCookies(response: NextResponse, cookies: CookieToSet[]): NextResponse {
  for (const { name, value, options } of cookies) response.cookies.set(name, value, options);
  return response;
}

/**
 * Área privada (/app, /admin):
 * - sessão renovada a cada requisição (CF-030); sem sessão, /app e /admin mandam para o login
 *   guardando o destino. Papel e MFA do /admin são decididos no layout dele (CF-034);
 * - CSP com nonce (CF-152): o Next lê o nonce do header da requisição e o aplica aos próprios
 *   scripts; as páginas daqui são dinâmicas, senão ficariam sem nonce;
 * - `private, no-store` (CF-163). As rotas públicas recebem a CSP estática do next.config.ts.
 */
export async function proxy(request: NextRequest) {
  const { user, cookies } = await refreshSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isPrivatePath(pathname)) {
    const login = new URL('/entrar', request.url);
    login.searchParams.set('next', `${pathname}${search}`);
    return withCookies(NextResponse.redirect(login), cookies);
  }

  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  // Criado depois do refreshSession: leva o cookie de sessão já renovado.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Cache-Control', 'private, no-store');
  return withCookies(response, cookies);
}

// Mesmos prefixos de PRIVATE_PREFIXES (o matcher precisa ser literal); `:path*` inclui a raiz
// (/app). Prefetch do next/link fica de fora.
export const config = {
  matcher: [
    {
      source: '/(app|admin)/:path*',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
