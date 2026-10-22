import type { AppEnv } from './environment.js';

/**
 * Feature flags por ambiente (CF-158): módulos ainda não lançados ficam fora da navegação e da
 * API, sem CTA morto (PRD §4, doc G §5). Avaliadas só no servidor, nunca em NEXT_PUBLIC_*.
 *
 * Cada módulo novo entra aqui com a sua flag; quando lançado em produção, a flag sai do catálogo
 * e o código passa a ser incondicional.
 */
export const FEATURE_FLAGS = {
  learning: 'Cursos, trilhas e aulas (CF-080…084)',
  community: 'Comunidade: diretório, grupos e posts (CF-090…096)',
  events: 'Café Estratégico: edições, ingressos e check-in (CF-060…070)',
  planning: 'Minha Jornada: diagnóstico e metas (CF-102, CF-103)',
  live_sessions: 'Ao Vivo: encontros online (CF-086)',
  resources: 'Cofre de Materiais (CF-085)',
  checkout: 'Assinatura e compra pelo gateway (CF-043…045)',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export type FeatureFlagState = Record<FeatureFlag, boolean>;

export const featureFlagKeys = Object.keys(FEATURE_FLAGS) as FeatureFlag[];

/** Padrão: tudo ligado em dev (para construir); desligado em staging e produção até liberar. */
const DEFAULT_ENABLED: Record<AppEnv, boolean> = {
  development: true,
  staging: false,
  production: false,
};

export class InvalidFeatureFlagsError extends Error {}

function isFeatureFlag(value: string): value is FeatureFlag {
  return Object.hasOwn(FEATURE_FLAGS, value);
}

/**
 * Resolve o estado das flags no ambiente. `override` é a variável `FEATURE_FLAGS`: lista separada
 * por vírgula, `nome` liga e `-nome` desliga (ex.: `community,events,-planning`). Nome
 * desconhecido lança erro, para um erro de digitação não passar despercebido.
 */
export function resolveFeatureFlags(appEnv: AppEnv, override?: string): FeatureFlagState {
  const state = Object.fromEntries(
    featureFlagKeys.map((key) => [key, DEFAULT_ENABLED[appEnv]]),
  ) as FeatureFlagState;

  for (const raw of (override ?? '').split(',')) {
    const token = raw.trim();
    if (!token) continue;
    const enabled = !token.startsWith('-');
    const name = enabled ? token : token.slice(1);
    if (!isFeatureFlag(name)) {
      throw new InvalidFeatureFlagsError(
        `FEATURE_FLAGS: flag desconhecida "${name}". Válidas: ${featureFlagKeys.join(', ')}`,
      );
    }
    state[name] = enabled;
  }
  return state;
}
