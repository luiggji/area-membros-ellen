import path from 'node:path';

import type { NextConfig } from 'next';

import { buildCsp } from './src/shared/security/csp';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Cabeçalhos de segurança aplicados a todas as respostas (mesmo padrão do landing-ELLEN).
 * Camera fica bloqueada até o check-in por QR (CF-068) liberar `camera=(self)` na rota de check-in.
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

/** CSP estática das páginas públicas (CF-152); a área privada recebe a CSP com nonce do proxy.ts. */
const publicCsp = buildCsp({
  isDev,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Raiz do monorepo: evita que o Next infira a raiz errada (há um repo git na home do usuário).
  turbopack: { root: path.join(import.meta.dirname, '../..') },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Tudo menos /app e /admin (e suas subrotas), que ficam com o nonce do proxy.
      {
        source: '/((?!app(?:/|$)|admin(?:/|$)).*)',
        headers: [{ key: 'Content-Security-Policy', value: publicCsp }],
      },
    ];
  },
};

export default nextConfig;
