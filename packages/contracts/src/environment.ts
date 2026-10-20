import { z } from 'zod';

/**
 * Ambientes da Caixa Forte (CF-012). Cada um tem banco, storage, gateway e chaves próprios;
 * staging nunca consulta dados reais. A regra é pura para rodar igual na API e no web.
 */
export const appEnvSchema = z.enum(['development', 'staging', 'production']);

export type AppEnv = z.infer<typeof appEnvSchema>;

/** Identificador do projeto Supabase a partir da URL (`https://<ref>.supabase.co`). */
export function supabaseProjectRef(url: string): string {
  // Sem `URL`: o pacote roda em browser, Node e edge sem depender de lib DOM/Node.
  const host = /^[a-z]+:\/\/([^/:?#]+)/i.exec(url)?.[1]?.toLowerCase() ?? url;
  if (host === 'localhost' || host === '127.0.0.1') return 'local';
  return /^([a-z0-9]+)\.supabase\.co$/.exec(host)?.[1] ?? host;
}

export type EnvironmentIsolation =
  | { status: 'not-configured' }
  | { status: 'ok'; projectRef: string }
  | { status: 'violation'; reason: string };

/**
 * Confere se o ambiente aponta para o banco certo. `productionProjectRef` é público (não é
 * segredo) e serve para barrar staging/dev apontando para produção por engano.
 */
export function checkEnvironmentIsolation({
  appEnv,
  supabaseUrl,
  productionProjectRef,
}: {
  appEnv: AppEnv;
  supabaseUrl?: string;
  productionProjectRef?: string;
}): EnvironmentIsolation {
  if (!supabaseUrl) {
    return appEnv === 'development'
      ? { status: 'not-configured' }
      : { status: 'violation', reason: `${appEnv} exige SUPABASE_URL próprio` };
  }
  const projectRef = supabaseProjectRef(supabaseUrl);
  if (appEnv !== 'production' && productionProjectRef && projectRef === productionProjectRef) {
    return { status: 'violation', reason: `${appEnv} está apontando para o banco de produção` };
  }
  if (appEnv === 'production' && projectRef === 'local') {
    return { status: 'violation', reason: 'produção não pode usar banco local' };
  }
  if (appEnv === 'production' && productionProjectRef && projectRef !== productionProjectRef) {
    return { status: 'violation', reason: 'produção apontando para outro projeto Supabase' };
  }
  return { status: 'ok', projectRef };
}
