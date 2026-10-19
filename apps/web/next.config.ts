import path from 'node:path';

import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Cabeçalhos de segurança aplicados a todas as respostas (mesmo padrão do landing-ELLEN).
 * CSP inicial: 'unsafe-inline' é provisório até a CSP com nonce (CF-152).
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
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ''}`.trim(),
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Raiz do monorepo: evita que o Next infira a raiz errada (há um repo git na home do usuário).
  turbopack: { root: path.join(import.meta.dirname, '../..') },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
