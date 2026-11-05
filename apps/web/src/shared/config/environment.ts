import {
  appEnvSchema,
  checkEnvironmentIsolation,
  type AppEnv,
  type EnvironmentIsolation,
} from '@caixa-forte/contracts';

export interface EnvironmentStatus {
  appEnv: AppEnv;
  isolation: EnvironmentIsolation;
}

/**
 * Ambiente lógico do web (CF-012), lido só no servidor. `APP_ENV` inválido cai em `development`
 * para nunca se passar por produção.
 */
export function environmentStatus(env: Record<string, string | undefined>): EnvironmentStatus {
  const parsed = appEnvSchema.safeParse(env.APP_ENV);
  const appEnv = parsed.success ? parsed.data : 'development';
  return {
    appEnv,
    isolation: checkEnvironmentIsolation({
      appEnv,
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL || undefined,
      productionProjectRef: env.SUPABASE_PRODUCTION_REF || undefined,
    }),
  };
}
