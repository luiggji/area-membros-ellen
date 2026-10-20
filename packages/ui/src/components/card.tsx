import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn.js';

export type CardTone = 'surface' | 'muted' | 'deep';

const tones: Record<CardTone, string> = {
  // Leitura: cursos, posts, listas. Borda fina, sem sombra (doc G §2).
  surface: 'border border-cf-border bg-cf-surface',
  // Destaque: jornada e cartões auxiliares da home.
  muted: 'border border-cf-border bg-cf-surface-muted',
  // Superfície profunda: uso raro, pontos de marca — nunca a tela inteira.
  deep: 'bg-cf-sidebar text-cream-50',
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: CardTone;
  as?: 'div' | 'article' | 'section' | 'li';
}

export function Card({ tone = 'surface', as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cn('rounded-(--radius-card) p-6', tones[tone], className)} {...props} />;
}

/** Bloco de carregamento: ocupa o lugar do conteúdo real sem simular dado. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('animate-pulse rounded-xl bg-cf-surface-muted', className)} />
  );
}
