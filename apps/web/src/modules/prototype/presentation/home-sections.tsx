import { buttonClasses, cn } from '@caixa-forte/ui';
import { ArrowRight, ChartNoAxesColumn, Coffee, Flag, ImageIcon, Play, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  type ExampleCourse,
  exampleCourses,
  exampleJourney,
  type HomeVariant,
} from '../domain/fixtures';
import { hrefFor } from './nav-links';

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase">
      {children}
    </p>
  );
}

function ExampleTag() {
  return (
    <span className="rounded-full bg-cf-surface/80 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-cf-text-secondary uppercase">
      Exemplo
    </span>
  );
}

/** Lugar reservado para fotografia editorial AUTORIZADA (doc G §6, P-006). Sem foto falsa. */
function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 bg-linear-to-br from-cf-surface-muted to-blush-200 text-center text-cf-text-secondary',
        className,
      )}
    >
      <ImageIcon aria-hidden className="size-6 max-sm:hidden" strokeWidth={1.4} />
      <span className="max-w-48 px-3 text-xs max-sm:sr-only">{label}</span>
    </div>
  );
}

function PrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClasses({ className: 'px-7' })}>
      {children}
      <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
    </Link>
  );
}

export function EditorialHero() {
  return (
    <section className="grid items-center gap-8 pt-4 md:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-3">
        <Eyebrow>Bem-vindo(a)</Eyebrow>
        <h1 className="font-editorial text-5xl leading-none font-semibold text-cf-sidebar sm:text-6xl">
          Caixa Forte
        </h1>
        <p className="font-editorial text-2xl text-cf-sidebar">
          Conhecimento. Estratégia. Evolução.
        </p>
        <p className="max-w-[46ch] text-cf-text-secondary">
          A comunidade para quem advoga e deseja construir uma carreira mais próspera, estratégica e
          livre.
        </p>
      </div>
      <PhotoPlaceholder
        label="Fotografia editorial autorizada (pendente — P-006)"
        className="hidden aspect-[16/9] rounded-(--radius-card) md:flex"
      />
    </section>
  );
}

/** Um único CTA por estado (doc G §4.1): continuar jornada OU começar diagnóstico. */
export function JourneyFocusCard({ variant }: { variant: HomeVariant }) {
  const isNew = variant === 'novo';
  const { completedModules, totalModules } = exampleJourney;
  return (
    <section
      aria-labelledby="jornada-titulo"
      className="flex flex-col gap-6 rounded-(--radius-card) border border-cf-border bg-cf-surface-muted p-6 sm:flex-row sm:items-center sm:p-8"
    >
      <span
        aria-hidden
        className="grid size-14 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary sm:size-20"
      >
        <Flag className="size-6 sm:size-8" strokeWidth={1.4} />
      </span>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <Eyebrow>{isNew ? 'Comece por aqui' : 'Minha jornada'}</Eyebrow>
          <ExampleTag />
        </div>
        <h2 id="jornada-titulo" className="font-editorial text-3xl font-semibold text-cf-sidebar">
          {isNew ? 'Diagnóstico inicial' : exampleJourney.title}
        </h2>
        <p className="text-cf-text-secondary">
          {isNew
            ? 'Responda algumas perguntas para receber o caminho recomendado para o seu momento.'
            : exampleJourney.summary}
        </p>
        {!isNew && (
          <div className="flex max-w-md items-center gap-4">
            <div
              role="progressbar"
              aria-label="Progresso da jornada (exemplo)"
              aria-valuemin={0}
              aria-valuemax={totalModules}
              aria-valuenow={completedModules}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-blush-200"
            >
              <div
                className="h-full rounded-full bg-cf-primary"
                style={{ width: `${(completedModules / totalModules) * 100}%` }}
              />
            </div>
            <span className="text-sm text-cf-text-secondary">
              {completedModules} de {totalModules} módulos
            </span>
          </div>
        )}
        <div className="pt-1">
          <PrimaryCta href={hrefFor('jornada')}>
            {isNew ? 'Começar diagnóstico' : 'Continuar'}
          </PrimaryCta>
        </div>
      </div>
    </section>
  );
}

const courseIcons = { play: Play, users: Users, chart: ChartNoAxesColumn };

function CourseCard({ course }: { course: ExampleCourse }) {
  const Icon = courseIcons[course.icon];
  return (
    <li>
      <Link
        href={hrefFor('cursos')}
        className="group flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-cf-border bg-cf-surface transition-shadow duration-200 hover:shadow-sm"
      >
        <div className="relative">
          <PhotoPlaceholder label="Capa do curso" className="aspect-[4/3] sm:aspect-[16/9]" />
          <span className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-cf-surface/90 text-cf-primary">
            <Icon aria-hidden className="size-4" strokeWidth={1.6} />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3 sm:p-5">
          <h3 className="font-editorial text-base leading-tight font-semibold text-cf-sidebar sm:text-xl">
            {course.title}
          </h3>
          <p className="hidden text-sm text-cf-text-secondary sm:block">{course.summary}</p>
        </div>
      </Link>
    </li>
  );
}

export function FeaturedCourses() {
  return (
    <section aria-labelledby="cursos-titulo" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2
            id="cursos-titulo"
            className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase"
          >
            Cursos em destaque
          </h2>
          <ExampleTag />
        </div>
        <Link
          href={hrefFor('cursos')}
          className="inline-flex min-h-11 items-center gap-1 text-sm text-cf-text hover:text-cf-primary"
        >
          Ver todos <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-3 sm:gap-5">
        {exampleCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </ul>
    </section>
  );
}

function AuxiliaryCard({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex gap-5 rounded-(--radius-card) border border-cf-border bg-cf-surface-muted p-6">
      <span
        aria-hidden
        className="grid size-14 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary"
      >
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="font-editorial text-2xl font-semibold text-cf-sidebar">{title}</h3>
        {children}
      </div>
    </article>
  );
}

/** No máximo 2 cartões complementares na home (doc G §4.1). */
export function AuxiliaryCards() {
  return (
    <section aria-label="Destaques complementares" className="grid gap-5 md:grid-cols-2">
      <AuxiliaryCard
        icon={<Coffee className="size-6" strokeWidth={1.4} />}
        eyebrow="Próximo encontro"
        title="Café Estratégico"
      >
        <p className="text-sm text-cf-text-secondary">
          Networking e troca de experiências. Data e local a confirmar.
        </p>
        <div className="pt-2">
          <PrimaryCta href={hrefFor('cafe')}>Quero participar</PrimaryCta>
        </div>
      </AuxiliaryCard>
      <AuxiliaryCard
        icon={<Users className="size-6" strokeWidth={1.4} />}
        eyebrow="Comunidade"
        title="Conexões que impulsionam"
      >
        <p className="text-sm text-cf-text-secondary">
          Troque experiências, tire dúvidas e construa conexões reais com outros colegas.
        </p>
        <Link
          href={hrefFor('comunidade')}
          className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-cf-primary hover:text-cf-sidebar"
        >
          Ir para a comunidade <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
        </Link>
      </AuxiliaryCard>
    </section>
  );
}
