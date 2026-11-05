'use client';

import {
  BRAZIL_STATES,
  MAIN_GOALS,
  type MainGoal,
  PROFESSIONAL_STAGES,
  type ProfessionalStage,
} from '@caixa-forte/contracts';
import { Button, ChoiceCards, Notice, SelectField, TextField } from '@caixa-forte/ui';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { FormState } from '../application/auth-use-cases';
import { ONBOARDING_STEPS, type OnboardingStep } from '../domain/onboarding';
import type { ProfileRow } from '../infrastructure/supabase-profile';
import { saveOnboardingStepAction } from './profile-actions';

const stageOptions = (Object.keys(PROFESSIONAL_STAGES) as ProfessionalStage[]).map((value) => ({
  value,
  label: PROFESSIONAL_STAGES[value],
}));
const goalOptions = (Object.keys(MAIN_GOALS) as MainGoal[]).map((value) => ({
  value,
  label: MAIN_GOALS[value].label,
  description: MAIN_GOALS[value].description,
}));

function Continue({ last }: { last: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Salvando…' : last ? 'Concluir' : 'Continuar'}
    </Button>
  );
}

/** Uma etapa do onboarding (CF-035): um formulário por vez, gravado ao continuar (doc G §4.6). */
export function OnboardingStepForm({
  step,
  profile,
}: {
  step: OnboardingStep;
  profile: ProfileRow | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveOnboardingStepAction, {
    status: 'idle',
  });
  const error = (field: string) =>
    state.status === 'error' ? state.fieldErrors?.[field] : undefined;
  const typed = (field: 'city' | 'state') =>
    state.status === 'error' && state.values?.[field] !== undefined
      ? state.values[field]
      : (profile?.[field] ?? '');
  const index = ONBOARDING_STEPS.indexOf(step);
  const previous = ONBOARDING_STEPS[index - 1];

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="step" value={step} />
      {state.status === 'error' && state.message ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : null}

      {step === 'carreira' ? (
        <ChoiceCards
          name="professional_stage"
          legend="Qual é o seu momento na advocacia?"
          options={stageOptions}
          defaultValue={profile?.professional_stage ?? undefined}
          error={error('professional_stage')}
        />
      ) : null}

      {step === 'local' ? (
        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <TextField
            name="city"
            label="Cidade onde você atua"
            autoComplete="address-level2"
            defaultValue={typed('city')}
            error={error('city')}
          />
          <SelectField
            name="state"
            label="UF"
            placeholder="—"
            options={BRAZIL_STATES.map((uf) => ({ value: uf, label: uf }))}
            defaultValue={typed('state')}
            error={error('state')}
          />
        </div>
      ) : null}

      {step === 'objetivo' ? (
        <ChoiceCards
          name="main_goal"
          legend="O que você mais quer agora?"
          options={goalOptions}
          defaultValue={profile?.main_goal ?? undefined}
          error={error('main_goal')}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Continue last={index === ONBOARDING_STEPS.length - 1} />
        {previous ? (
          <Link
            href={`/app/jornada?etapa=${previous}`}
            className="text-sm text-cf-primary underline underline-offset-4"
          >
            Voltar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
