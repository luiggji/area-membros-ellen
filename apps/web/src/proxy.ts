import { type NextRequest, NextResponse } from 'next/server';

import { buildCsp, createNonce } from '@/shared/security/csp';

/**
 * CSP com nonce na área privada (CF-152). O Next lê o nonce do header da requisição e o aplica
 * aos próprios scripts; as páginas daqui precisam ser dinâmicas (sessão), senão ficam sem nonce.
 * As rotas públicas recebem a CSP estática do next.config.ts.
 */
export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  // Página de membro/equipe nunca entra em cache compartilhado (CDN, proxy) (CF-163).
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
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
