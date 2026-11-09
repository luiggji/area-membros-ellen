import { buttonClasses, Card, ChoiceCards, cn, TextAreaField, TextField } from '@caixa-forte/ui';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

import {
  diagnosticQuestion,
  examplePlan,
  type JourneyStep,
  journeySteps,
} from '../domain/learning-fixtures';
import { hrefFor } from './nav-links';
import { ExampleTag, PageHeader, ScreenPage } from './page-parts';

const stepHref = (slug: JourneyStep) => `${hrefFor('jornada')}?passo=${slug}`;

/** Stepper curto (doc G §4.6): a etapa atual em destaque, as outras como caminho. */
function Stepper({ current }: { current: JourneyStep }) {
  const currentIndex = journeySteps.findIndex((step) => step.slug === current);
  return (
    <nav aria-label="Etapas da jornada">
      <ol className="grid gap-3 sm:grid-cols-3">
        {journeySteps.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'next';
          return (
            <li key={step.slug}>
              <Link
                href={stepHref(step.slug)}
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex min-h-11 items-start gap-3 rounded-card border p-4',
                  state === 'current'
                    ? 'border-cf-primary bg-cf-surface'
                    : 'border-cf-border bg-cf-surface-muted hover:border-cf-primary',
                )}
              >
                {state === 'done' ? (
                  <CheckCircle2 aria-hidden className="size-5 shrink-0 text-cf-primary" />
                ) : (
                  <Circle aria-hidden className="size-5 shrink-0 text-cf-text-secondary" />
                )}
                <span className="flex flex-col">
                  <span className="text-xs text-cf-text-secondary">Etapa {index + 1}</span>
                  <span className="font-medium text-cf-text">{step.label}</span>
                  <span className="text-sm text-cf-text-secondary">{step.summary}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function NextLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-cf-border pt-6 sm:flex-row sm:items-center">
      <p className="text-sm text-cf-text-secondary">Suas respostas ficam salvas para retomar.</p>
      <Link href={href} className={buttonClasses({ className: 'sm:ms-auto' })}>
        {label} <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
      </Link>
    </div>
  );
}

function StepBody({ step }: { step: JourneyStep }) {
  if (step === 'diagnostico') {
    return (
      <>
        <p className="flex items-center gap-2 text-sm text-cf-text-secondary">
          Pergunta 1 de 6 <ExampleTag />
        </p>
        <ChoiceCards
          name="experiencia"
          legend={diagnosticQuestion.legend}
          options={diagnosticQuestion.options}
          defaultValue="transicao"
        />
        <NextLink href={stepHref('objetivo')} label="Salvar e continuar" />
      </>
    );
  }
  if (step === 'objetivo') {
    return (
      <>
        <TextAreaField
          name="objetivo"
          label="Qual resultado você quer alcançar em 90 dias?"
          helper="Uma frase concreta, que você consiga verificar no fim do prazo."
          defaultValue={examplePlan.goal}
          rows={3}
        />
        <TextField name="prazo" label="Prazo" defaultValue={examplePlan.deadline} />
        <NextLink href={stepHref('acoes')} label="Salvar e definir ações" />
      </>
    );
  }
  return (
    <>
      <p className="text-cf-text-secondary">Três ações para os próximos 30 dias:</p>
      <ol className="flex flex-col gap-3">
        {examplePlan.actions.map((action, index) => (
          <li key={action.title}>
            <TextField
              name={`acao-${index}`}
              label={`Ação ${index + 1}`}
              defaultValue={action.title}
            />
          </li>
        ))}
      </ol>
      <NextLink href={hrefFor('planejamento')} label="Ver meu planejamento" />
    </>
  );
}

/** Minha Jornada: diagnóstico → objetivo de 90 dias → ações de 30 dias, um formulário por vez. */
export function JourneyScreen({ step }: { step: JourneyStep }) {
  const current = journeySteps.find((item) => item.slug === step)!;
  return (
    <ScreenPage width="reading">
      <PageHeader
        title="Minha Jornada"
        summary="Um caminho curto: entender onde você está, escolher aonde ir e começar."
      />
      <Stepper current={step} />
      <Card className="flex flex-col gap-5 sm:p-8">
        <h2 className="font-editorial text-2xl text-cf-text">{current.label}</h2>
        <StepBody step={step} />
      </Card>
    </ScreenPage>
  );
}

/** Meu Planejamento: o objetivo de 90 dias e as 3 ações de 30 dias, sem score artificial. */
export function PlanningScreen() {
  const done = examplePlan.actions.filter((action) => action.done).length;
  return (
    <ScreenPage width="reading">
      <PageHeader
        title="Meu Planejamento"
        summary="Seu objetivo e as próximas ações. Só você vê este planejamento."
      />
      <Card tone="muted" className="flex flex-col gap-2 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-cf-primary uppercase">
          Objetivo de 90 dias <ExampleTag />
        </p>
        <p className="font-editorial text-2xl text-cf-text">{examplePlan.goal}</p>
        <p className="text-sm text-cf-text-secondary">Prazo: {examplePlan.deadline}</p>
        <Link
          href={stepHref('objetivo')}
          className={buttonClasses({ variant: 'link', className: 'self-start' })}
        >
          Revisar objetivo
        </Link>
      </Card>
      <section aria-labelledby="acoes-titulo" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="acoes-titulo" className="font-editorial text-xl text-cf-text">
            Ações dos próximos 30 dias
          </h2>
          <p className="text-sm text-cf-text-secondary">
            {done} de {examplePlan.actions.length} feitas
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-cf-border rounded-card border border-cf-border bg-cf-surface">
          {examplePlan.actions.map((action) => (
            <li key={action.title} className="flex min-h-14 items-center gap-3 px-5 py-3">
              {action.done ? (
                <CheckCircle2 aria-hidden className="size-5 shrink-0 text-cf-primary" />
              ) : (
                <Circle aria-hidden className="size-5 shrink-0 text-cf-text-secondary" />
              )}
              <span
                className={cn('text-cf-text', action.done && 'text-cf-text-secondary line-through')}
              >
                {action.title}
                <span className="sr-only">{action.done ? ' (feita)' : ' (a fazer)'}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={stepHref('acoes')}
          className={buttonClasses({ variant: 'secondary', className: 'self-start' })}
        >
          Editar ações
        </Link>
      </section>
    </ScreenPage>
  );
}
