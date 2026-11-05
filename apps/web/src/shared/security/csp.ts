/**
 * Content-Security-Policy do web (CF-152), híbrida por decisão do Luiggi (22/10/2026):
 * - área privada (`/app`, `/admin`): nonce por requisição + 'strict-dynamic' (proxy.ts). Essas
 *   páginas já são dinâmicas (sessão, no-store), então o nonce não custa cache;
 * - páginas públicas: política estática e cacheável (CF-163), ainda com 'unsafe-inline' nos scripts,
 *   porque não têm conteúdo de usuário.
 * Estilos ficam com 'unsafe-inline' nas duas: com nonce em style-src o navegador ignora
 * 'unsafe-inline' e quebra atributos `style`; o risco de XSS está nos scripts.
 */
export const PRIVATE_PREFIXES = ['/app', '/admin'] as const;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export interface CspOptions {
  /** Presente só na área privada: troca 'unsafe-inline' por nonce + 'strict-dynamic'. */
  nonce?: string;
  isDev: boolean;
  apiUrl?: string;
  supabaseUrl?: string;
}

/** Origens que o browser pode chamar: a própria app, a API e o Supabase (REST/Auth e Realtime). */
function connectSources({ apiUrl, supabaseUrl }: CspOptions): string[] {
  const sources = ["'self'"];
  if (apiUrl) sources.push(new URL(apiUrl).origin);
  if (supabaseUrl) {
    const { host } = new URL(supabaseUrl);
    sources.push(`https://${host}`, `wss://${host}`);
  }
  return sources;
}

/**
 * Vídeo do player (CF-083): o link assinado sai da API e redireciona ao provedor. A origem do
 * provedor entra aqui junto com o adaptador dele (P-007).
 */
function mediaSources({ apiUrl }: CspOptions): string[] {
  return apiUrl ? ["'self'", new URL(apiUrl).origin] : ["'self'"];
}

export function buildCsp(options: CspOptions): string {
  const { nonce, isDev } = options;
  const scriptSrc = nonce
    ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
    : ["'self'", "'unsafe-inline'"];
  // React usa eval só em dev, para reconstruir stacks de erro.
  if (isDev) scriptSrc.push("'unsafe-eval'");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSources(options).join(' ')}`,
    `media-src ${mediaSources(options).join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** Nonce imprevisível por requisição (Web Crypto: roda no runtime do proxy e no Node). */
export function createNonce(): string {
  return btoa(crypto.randomUUID());
}
