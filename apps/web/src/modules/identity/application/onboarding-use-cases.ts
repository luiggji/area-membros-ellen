import {
  onboardingGoalSchema,
  onboardingLocationSchema,
  onboardingStageSchema,
} from '@caixa-forte/contracts';

import { fieldErrors } from '../domain/credentials';
import { ONBOARDING_STEPS, type OnboardingStep } from '../domain/onboarding';
import type { AuthResult } from './auth-use-cases';

/** Campos que o onboarding pode gravar. `directory_opt_in` fica de fora de propósito (CF-035). */
export interface OnboardingPatch {
  professional_stage?: string;
  city?: string;
  state?: string;
  main_goal?: string;
  onboarding_completed_at?: string;
}

export interface OnboardingRepository {
  saveOnboarding(patch: OnboardingPatch): Promise<boolean>;
}

const schemas = {
  carreira: onboardingStageSchema,
  local: onboardingLocationSchema,
  objetivo: onboardingGoalSchema,
} as const;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** Grava uma etapa e segue para a próxima; a última conclui o onboarding e volta ao início. */
export async function saveOnboardingStep(
  input: Record<string, unknown>,
  repo: OnboardingRepository,
  now: () => Date = () => new Date(),
): Promise<AuthResult> {
  const step = text(input.step) as OnboardingStep;
  if (!ONBOARDING_STEPS.includes(step)) return { status: 'error', message: 'Etapa inválida.' };

  const parsed = schemas[step].safeParse(input);
  if (!parsed.success) {
    const values = { city: text(input.city), state: text(input.state) };
    return { status: 'error', fieldErrors: fieldErrors(parsed.error), values };
  }

  const isLast = step === ONBOARDING_STEPS.at(-1);
  const patch: OnboardingPatch = {
    ...parsed.data,
    ...(isLast && { onboarding_completed_at: now().toISOString() }),
  };
  if (!(await repo.saveOnboarding(patch))) {
    return { status: 'error', message: 'Não foi possível salvar agora. Tente novamente.' };
  }

  const next = ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1];
  return { status: 'redirect', to: next ? `/app/jornada?etapa=${next}` : '/app' };
}
