/**
 * Modo demonstração (CF-177): as rotas oficiais (`/app`) mostram as telas do MVP com conteúdo de
 * exemplo, para Ellen validar no app de verdade antes de cada módulo ter dados reais.
 * - só liga com `DEMO_MODE=true` (variável server-only) **e** `APP_ENV` explícito `development`
 *   ou `staging`;
 * - produção, `APP_ENV` ausente ou inválido: desligado, mesmo que alguém esqueça a variável.
 */
export function isDemoEnabled(env: Record<string, string | undefined>): boolean {
  if (env.DEMO_MODE !== 'true') return false;
  return env.APP_ENV === 'development' || env.APP_ENV === 'staging';
}

/** Leitura no servidor, a cada requisição (o mesmo build serve staging e produção). */
export function demoMode(): boolean {
  return isDemoEnabled(process.env);
}
