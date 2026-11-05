import type { ReactNode } from 'react';

import { cn } from '../lib/cn.js';
import { Skeleton } from './card.js';

/**
 * Estados de tela (CF-157, doc G §3 e COPY_TONE): frase verdadeira, uma ação quando houver
 * caminho, nada de dado simulado. Título editorial curto; o resto em Inter.
 */
interface StateProps {
  title: string;
  description?: ReactNode;
  /** No máximo uma ação principal (link ou botão de quem chama). */
  action?: ReactNode;
  /** Ícone decorativo opcional (lucide), renderizado num círculo rosé. */
  icon?: ReactNode;
  /** `page`: ocupa a área de conteúdo; `inline`: dentro de uma seção ou card. */
  size?: 'page' | 'inline';
  className?: string;
}

function StateLayout({
  title,
  description,
  action,
  icon,
  size = 'inline',
  className,
  eyebrow,
  headingLevel,
  tone = 'neutral',
}: StateProps & {
  eyebrow?: ReactNode;
  headingLevel: 'h1' | 'h2';
  tone?: 'neutral' | 'danger';
}) {
  const Heading = headingLevel;
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 text-center',
        size === 'page'
          ? 'mx-auto max-w-lg py-16 sm:py-24'
          : 'rounded-(--radius-card) border border-dashed border-cf-border px-5 py-10',
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden
          className={cn(
            'grid size-12 place-items-center rounded-full',
            tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-blush-200 text-cf-primary',
          )}
        >
          {icon}
        </span>
      ) : null}
      {eyebrow}
      <Heading
        className={cn(
          'font-editorial tracking-tight text-cf-text',
          size === 'page' ? 'text-3xl sm:text-4xl' : 'text-2xl',
        )}
      >
        {title}
      </Heading>
      {description ? <div className="max-w-prose text-cf-text-secondary">{description}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Nada para mostrar ainda (sem curso, sem evento, sem posts), com o próximo passo. */
export function EmptyState(props: StateProps) {
  return <StateLayout {...props} headingLevel={props.size === 'page' ? 'h1' : 'h2'} />;
}

export interface ErrorStateProps extends StateProps {
  /** Identificador sem PII para o suporte cruzar com os logs (ex.: `error.digest` do Next). */
  reference?: string;
  /** Rótulo curto acima do título, ex.: "Erro 404". */
  code?: string;
}

/** Falha ao carregar ou rota inexistente. Anunciado a leitores de tela (role="alert"). */
export function ErrorState({ reference, code, ...props }: ErrorStateProps) {
  return (
    <div role="alert">
      <StateLayout
        {...props}
        headingLevel={props.size === 'page' ? 'h1' : 'h2'}
        tone="danger"
        eyebrow={
          code ? (
            <p className="text-[0.7rem] font-semibold tracking-[0.19em] text-cf-primary uppercase">
              {code}
            </p>
          ) : undefined
        }
        description={
          props.description || reference ? (
            <>
              {props.description}
              {reference ? (
                <p className="mt-3 text-xs">
                  Código para o suporte: <span className="font-mono">{reference}</span>
                </p>
              ) : null}
            </>
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * Carregando: ocupa o lugar do conteúdo com blocos neutros e anuncia o estado uma vez (role
 * "status"), sem números nem textos falsos.
 */
export function LoadingState({
  label = 'Carregando',
  lines = 3,
  className,
}: {
  label?: string;
  lines?: number;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col gap-4', className)}>
      <span className="sr-only">{label}…</span>
      <Skeleton className="h-9 w-2/3 max-w-md rounded-lg" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4 rounded', index === lines - 1 ? 'w-1/2' : 'w-full')}
        />
      ))}
    </div>
  );
}
