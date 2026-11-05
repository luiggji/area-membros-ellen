import {
  appEnvSchema,
  type FeatureFlag,
  type FeatureFlagState,
  InvalidFeatureFlagsError,
  resolveFeatureFlags,
} from '@caixa-forte/contracts';

type Env = Record<string, string | undefined>;

/**
 * Feature flags do web (CF-158), avaliadas só no servidor: `FEATURE_FLAGS` não é NEXT_PUBLIC, e
 * quem decide o que existe é o servidor. No browser a função lança, em vez de devolver padrões
 * errados. Para Client Components, passe o booleano já resolvido por props.
 */
export function featureFlags(env: Env = process.env): FeatureFlagState {
  if (typeof window !== 'undefined') {
    throw new Error('Feature flags só podem ser lidas no servidor (CF-158).');
  }
  // Sem APP_ENV: `next dev` liga como a API (que assume development); build de produção desliga.
  // APP_ENV inválido: na dúvida, módulo não lançado fica desligado.
  const parsed = appEnvSchema.safeParse(
    env.APP_ENV ?? (env.NODE_ENV === 'development' ? 'development' : 'production'),
  );
  return resolveFeatureFlags(parsed.success ? parsed.data : 'production', env.FEATURE_FLAGS);
}

/** Ex.: esconder o item "Comunidade" da navegação enquanto o módulo não foi lançado. */
export function isFeatureEnabled(flag: FeatureFlag, env: Env = process.env): boolean {
  return featureFlags(env)[flag];
}

/** Para o `/status`: mostra o erro de configuração em vez de derrubar a página. */
export function featureFlagsStatus(
  env: Env = process.env,
): { ok: true; state: FeatureFlagState } | { ok: false; error: string } {
  try {
    return { ok: true, state: featureFlags(env) };
  } catch (error) {
    if (error instanceof InvalidFeatureFlagsError) return { ok: false, error: error.message };
    throw error;
  }
}
