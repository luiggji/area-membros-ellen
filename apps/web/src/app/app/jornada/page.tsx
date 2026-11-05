import {
  MAIN_GOALS,
  type MainGoal,
  PROFESSIONAL_STAGES,
  type ProfessionalStage,
} from '@caixa-forte/contracts';
import { buttonClasses } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ONBOARDING_STEPS, resolveOnboardingStep } from '@/modules/identity/domain/onboarding';
import { loadProfilePage } from '@/modules/identity/infrastructure/supabase-profile';
import { OnboardingStepForm } from '@/modules/identity/presentation/onboarding-step';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

export const metadata: Metadata = { title: 'Sua jornada · Caixa Forte' };

const STEP_COPY = {
  carreira: {
    title: 'Seu momento',
    text: 'Para mostrar conteúdos e colegas que façam sentido para você.',
  },
  local: {
    title: 'Onde você atua',
    text: 'Usamos para encontros e colegas por região. Fica privado.',
  },
  objetivo: { title: 'Seu objetivo', text: 'Você pode mudar quando quiser.' },
} as const;

type Search = Promise<{ etapa?: string }>;

/**
 * Onboarding (CF-035) em `/app/jornada` (PRD §4.2). Retoma na primeira etapa pendente; nada aqui
 * fica visível para outros membros (o diretório é opt-in à parte). O diagnóstico é o CF-102.
 */
export default async function JourneyPage({ searchParams }: { searchParams: Search }) {
  const user = await getSessionUser();
  if (!user) return null; // o layout de /app já redireciona; isto só satisfaz o tipo
  const { profile } = await loadProfilePage(await createSupabaseServerClient(), user.id);
  const step = resolveOnboardingStep((await searchParams).etapa, profile);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 py-12">
      {step ? (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-[0.7rem] font-semibold tracking-[0.19em] text-cf-primary uppercase">
              Etapa {ONBOARDING_STEPS.indexOf(step) + 1} de {ONBOARDING_STEPS.length}
            </p>
            <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
              {STEP_COPY[step].title}
            </h1>
            <p className="text-cf-text-secondary">{STEP_COPY[step].text}</p>
          </div>
          <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
            <OnboardingStepForm key={step} step={step} profile={profile} />
          </div>
        </>
      ) : (
        <Summary profile={profile} />
      )}
    </div>
  );
}

/** Onboarding concluído: mostra o que foi escolhido, com atalho para revisar cada etapa. */
function Summary({ profile }: { profile: Awaited<ReturnType<typeof loadProfilePage>>['profile'] }) {
  const rows = [
    {
      step: 'carreira',
      label: 'Momento',
      value: PROFESSIONAL_STAGES[profile?.professional_stage as ProfessionalStage] ?? '—',
    },
    {
      step: 'local',
      label: 'Onde atua',
      value: [profile?.city, profile?.state].filter(Boolean).join(' / ') || '—',
    },
    {
      step: 'objetivo',
      label: 'Objetivo',
      value: MAIN_GOALS[profile?.main_goal as MainGoal]?.label ?? '—',
    },
  ];
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
          Sua jornada
        </h1>
        <p className="text-cf-text-secondary">
          Estas escolhas guiam o que a plataforma sugere para você. O diagnóstico completo chega em
          breve.
        </p>
      </div>
      <dl className="flex flex-col rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
        {rows.map((row) => (
          <div
            key={row.step}
            className="flex items-center justify-between gap-4 border-t border-cf-border py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <div>
              <dt className="text-xs text-cf-text-secondary">{row.label}</dt>
              <dd className="text-cf-text">{row.value}</dd>
            </div>
            <Link
              href={`/app/jornada?etapa=${row.step}`}
              className="text-sm text-cf-primary underline underline-offset-4"
            >
              Alterar
            </Link>
          </div>
        ))}
      </dl>
      <div>
        <Link href="/app" className={buttonClasses()}>
          Ir para o início
        </Link>
      </div>
    </>
  );
}
