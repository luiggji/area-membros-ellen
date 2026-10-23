/** Etapas do onboarding (CF-035), na ordem do PRD: carreira → onde atua → objetivo. */
export const ONBOARDING_STEPS = ['carreira', 'local', 'objetivo'] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingSnapshot {
  professional_stage: string | null;
  city: string | null;
  state: string | null;
  main_goal: string | null;
  onboarding_completed_at: string | null;
}

/** Primeira etapa ainda não preenchida (retomada após interrupção); `null` = concluído. */
export function nextOnboardingStep(profile: OnboardingSnapshot | null): OnboardingStep | null {
  if (profile?.onboarding_completed_at) return null;
  if (!profile?.professional_stage) return 'carreira';
  if (!profile.city || !profile.state) return 'local';
  return 'objetivo';
}

/**
 * Etapa a mostrar: a pedida em `?etapa=` só se já foi alcançada (voltar para revisar), senão a
 * próxima pendente. Evita pular etapas pela URL.
 */
export function resolveOnboardingStep(
  requested: string | undefined,
  profile: OnboardingSnapshot | null,
): OnboardingStep | null {
  const next = nextOnboardingStep(profile);
  const reached = next === null ? ONBOARDING_STEPS.length - 1 : ONBOARDING_STEPS.indexOf(next);
  const wanted = ONBOARDING_STEPS.indexOf(requested as OnboardingStep);
  if (wanted >= 0 && wanted <= reached) return ONBOARDING_STEPS[wanted]!;
  return next;
}
