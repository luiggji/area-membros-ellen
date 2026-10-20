import { type ElementType, type ReactNode, useId } from 'react';

import { cn } from '../lib/cn.js';
import { Skeleton } from './card.js';

/**
 * Componentes editoriais da home e das vitrines (CF-022), no desenho do Brand System V2
 * (`docs/brand/v2/07_IMPLEMENTATION_NEXTJS/screenshots`). Só recebem dados prontos: nada de
 * progresso, curso ou evento inventado aqui — quem chama traz o que o servidor autorizou.
 */

/** Componente de link do app (ex.: `Link` do Next). O pacote não depende do router. */
export type LinkComponent = ElementType<{
  href: string;
  className?: string;
  children?: ReactNode;
}>;

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-[0.7rem] font-semibold tracking-[0.19em] text-cf-primary uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Círculo rosé com ícone decorativo (o ícone vem de quem chama). */
export function IconBadge({ children, size = 'md' }: { children: ReactNode; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary',
        size === 'lg' ? 'size-12 sm:size-16' : 'size-12',
      )}
    >
      {children}
    </span>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4', className)}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/**
 * Painel editorial no lugar da fotografia autorizada (doc G §6, P-006): gradiente da marca e uma
 * frase curta. Nunca uma foto de pessoa inventada.
 */
export function EditorialArt({
  caption,
  icon,
  className,
}: {
  caption?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-md bg-linear-to-br from-sand-100 to-blush-200 text-cf-primary',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-20 -right-24 size-80 rounded-full border-2 border-cf-surface/40"
      />
      {icon && <span aria-hidden>{icon}</span>}
      {caption && (
        <p className="absolute bottom-4 left-5 font-editorial text-lg text-cf-primary italic sm:text-xl">
          {caption}
        </p>
      )}
    </div>
  );
}

export function EditorialHero({
  eyebrow,
  title,
  tagline,
  description,
  media,
}: {
  eyebrow: string;
  title: string;
  tagline?: string;
  description?: string;
  /** Fotografia autorizada ou `EditorialArt`; some no mobile se não couber. */
  media?: ReactNode;
}) {
  return (
    <section className="grid items-center gap-6 rounded-lg border border-cf-border bg-cf-surface p-5 sm:p-9 md:grid-cols-[1.12fr_0.88fr] md:gap-8">
      <div className="flex flex-col gap-2 max-md:order-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-editorial text-4xl leading-tight tracking-tight text-cf-text sm:text-5xl">
          {title}
        </h1>
        {tagline && <p className="text-cf-text-secondary sm:text-lg">{tagline}</p>}
        {description && (
          <p className="max-w-[48ch] text-sm text-cf-text-secondary">{description}</p>
        )}
      </div>
      {media && <div className="max-md:order-1">{media}</div>}
    </section>
  );
}

export type JourneyState = 'novo' | 'em-progresso' | 'completo' | 'erro';

/**
 * Card da jornada com **um único** CTA por estado (doc G §4.1). A barra só aparece com
 * progresso real (`progress`) — sem dado, sem barra.
 */
export function JourneyFocusCard({
  state,
  eyebrow,
  title,
  summary,
  progress,
  note,
  icon,
  action,
}: {
  state: JourneyState;
  eyebrow: string;
  title: string;
  summary: string;
  progress?: { done: number; total: number; unit: string };
  note?: string;
  icon: ReactNode;
  /** O único CTA do card (ex.: `<Link className={buttonClasses()}>`). */
  action: ReactNode;
}) {
  const titleId = useId();
  const showProgress = state === 'em-progresso' && progress && progress.total > 0;
  return (
    <section
      aria-labelledby={titleId}
      data-state={state}
      className={cn(
        'grid items-center gap-4 rounded-lg border p-5 sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-7 lg:grid-cols-[auto_1fr_auto]',
        state === 'erro'
          ? 'border-danger/30 bg-cf-surface'
          : 'border-cf-border bg-linear-to-r from-sand-100 to-cf-surface',
      )}
    >
      <IconBadge size="lg">{icon}</IconBadge>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Eyebrow className={state === 'erro' ? 'text-danger' : undefined}>{eyebrow}</Eyebrow>
        <h2
          id={titleId}
          className="font-editorial text-2xl tracking-tight text-cf-text sm:text-3xl"
        >
          {title}
        </h2>
        <p className="text-cf-text-secondary">{summary}</p>
        {showProgress && (
          <div className="mt-2 flex max-w-md items-center gap-4">
            <div
              role="progressbar"
              aria-label={`Progresso: ${progress.done} de ${progress.total} ${progress.unit}`}
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-blush-200"
            >
              <div
                className="h-full rounded-full bg-cf-primary"
                style={{ width: `${Math.min(progress.done / progress.total, 1) * 100}%` }}
              />
            </div>
            <span className="text-sm whitespace-nowrap text-cf-text-secondary">
              {progress.done} de {progress.total} {progress.unit}
            </span>
          </div>
        )}
        {note && <p className="mt-1 text-xs text-cf-text-secondary">{note}</p>}
      </div>
      <div className="sm:col-start-2 lg:col-start-auto max-sm:*:w-full">{action}</div>
    </section>
  );
}

export type CourseStatus = 'disponivel' | 'programado' | 'indisponivel';

const statusLabel: Record<CourseStatus, string> = {
  disponivel: 'Disponível',
  programado: 'Em preparação',
  indisponivel: 'Indisponível no seu plano',
};

const coverTones = [
  'from-sand-100 to-blush-200',
  'from-blush-200 to-sand-100',
  'from-cream-50 to-blush-200',
] as const;

/** Capa sem foto: gradiente da marca + ícone. Capas reais entram com o CMS (CF-081). */
export function CourseCover({ icon, tone = 0 }: { icon?: ReactNode; tone?: number }) {
  return (
    <EditorialArt
      icon={icon}
      className={cn(
        'aspect-[2.7/1] rounded-none bg-linear-to-br sm:aspect-[2.2/1]',
        coverTones[tone % 3],
      )}
    />
  );
}

/**
 * Card de curso: título, resumo de até 2 linhas e estado verdadeiro. Curso indisponível não vira
 * link — o motivo aparece no próprio card.
 */
export function CourseCard({
  title,
  summary,
  status,
  href,
  linkAs: LinkAs = 'a',
  cover,
}: {
  title: string;
  summary: string;
  status: CourseStatus;
  href: string;
  linkAs?: LinkComponent;
  cover?: ReactNode;
}) {
  const body = (
    <>
      {cover ?? <CourseCover />}
      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <h3 className="font-editorial text-xl leading-snug text-cf-text">{title}</h3>
        <p className="line-clamp-2 text-sm text-cf-text-secondary">{summary}</p>
        {status !== 'disponivel' && (
          <p className="mt-auto pt-2 text-xs font-medium text-cf-primary">{statusLabel[status]}</p>
        )}
      </div>
    </>
  );
  const frame =
    'flex h-full flex-col overflow-hidden rounded-card border border-cf-border bg-cf-surface';

  if (status === 'indisponivel') {
    return <div className={cn(frame, 'opacity-80')}>{body}</div>;
  }
  return (
    <LinkAs
      href={href}
      className={cn(
        frame,
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-hover motion-reduce:hover:translate-y-0',
      )}
    >
      {body}
    </LinkAs>
  );
}

export function CourseCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col overflow-hidden rounded-card border border-cf-border bg-cf-surface"
    >
      <Skeleton className="aspect-[2.2/1] rounded-none" />
      <div className="flex flex-col gap-2 p-5">
        <Skeleton className="h-5 w-2/3 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
    </div>
  );
}

/** Grade 3/2/1 (kit: desktop/tablet/mobile). Vazia, mostra uma frase verdadeira no lugar. */
export function CourseGrid({ children, empty }: { children?: ReactNode; empty: string }) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);
  if (!hasItems) {
    return (
      <p className="rounded-card border border-dashed border-cf-border px-5 py-8 text-center text-sm text-cf-text-secondary">
        {empty}
      </p>
    );
  }
  return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>li]:min-w-0">{children}</ul>;
}

/** Título de seção editorial com um link discreto ("Ver todos"). */
export function SectionHeader({
  id,
  title,
  action,
}: {
  id: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 id={id} className="font-editorial text-2xl tracking-tight text-cf-text sm:text-3xl">
        {title}
      </h2>
      {action}
    </div>
  );
}

/** Cartão auxiliar compacto (próximo encontro, comunidade): o card inteiro é o link. */
export function CompactCard({
  icon,
  eyebrow,
  title,
  description,
  href,
  linkAs: LinkAs = 'a',
  tone = 'surface',
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkAs?: LinkComponent;
  tone?: 'surface' | 'muted';
}) {
  return (
    <LinkAs
      href={href}
      className={cn(
        'group flex min-h-30 items-center gap-4 rounded-card border border-cf-border p-5 transition-shadow duration-200 hover:shadow-card sm:p-6',
        tone === 'muted' ? 'bg-sand-100' : 'bg-cf-surface',
      )}
    >
      <IconBadge>{icon}</IconBadge>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <Eyebrow>{eyebrow}</Eyebrow>
        <span className="font-editorial text-xl leading-snug text-cf-text">{title}</span>
        <span className="text-sm text-cf-text-secondary">{description}</span>
      </span>
      <ArrowIcon className="shrink-0 text-cf-primary transition-transform duration-200 group-hover:translate-x-0.5" />
    </LinkAs>
  );
}
