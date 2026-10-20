/**
 * O protótipo de homologação (`/prototipo`, CF-169) existe só fora de produção.
 * - `next dev` (NODE_ENV=development): ligado.
 * - staging/preview: ligado apenas com `ENABLE_PROTOTYPE=true` (variável server-only).
 * - produção: desligado, mesmo que alguém esqueça a variável — exige opt-in explícito.
 */
export function isPrototypeEnabled(env: Record<string, string | undefined>): boolean {
  if (env.ENABLE_PROTOTYPE === 'true') return true;
  if (env.ENABLE_PROTOTYPE === 'false') return false;
  return env.NODE_ENV === 'development';
}
