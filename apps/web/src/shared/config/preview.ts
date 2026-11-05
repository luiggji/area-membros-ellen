/**
 * Rotas internas de preview (`/prototipo` CF-169, `/design` e `/status` CF-170) existem só fora
 * de produção.
 * - `next dev` (NODE_ENV=development): ligadas.
 * - staging/preview: ligadas apenas com `ENABLE_PREVIEW_ROUTES=true` (variável server-only).
 * - produção: desligadas, mesmo que alguém esqueça a variável — exige opt-in explícito.
 */
export function isPreviewEnabled(env: Record<string, string | undefined>): boolean {
  if (env.ENABLE_PREVIEW_ROUTES === 'true') return true;
  if (env.ENABLE_PREVIEW_ROUTES === 'false') return false;
  return env.NODE_ENV === 'development';
}
