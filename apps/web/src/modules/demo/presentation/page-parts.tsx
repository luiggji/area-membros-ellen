import { cn } from '@caixa-forte/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Selo ao lado de todo dado fictício da demonstração: nada se passa por real (doc G §7). */
export function ExampleTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-cf-border px-2 py-0.5 align-middle text-[0.65rem] font-medium tracking-wide text-cf-text-secondary uppercase',
        className,
      )}
    >
      Exemplo
    </span>
  );
}

/** Avatar sem foto: inicial num círculo rosé, nunca rosto inventado (doc G §4.5). */
export function Initials({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-blush-200 font-medium text-cf-primary',
        size === 'lg' ? 'size-16 text-xl' : 'size-10',
      )}
    >
      {name.charAt(0)}
    </span>
  );
}

/** Coluna de conteúdo das telas de demonstração, na mesma largura das páginas reais. */
export function ScreenPage({
  width = 'wide',
  children,
}: {
  width?: 'wide' | 'reading';
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full min-w-0 flex-col gap-8 pt-2 pb-12',
        width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
      )}
    >
      {children}
    </div>
  );
}

/** Cabeçalho pequeno das telas internas (doc G §4.2): título, 1 linha e ações discretas. */
export function PageHeader({
  title,
  summary,
  back,
  children,
}: {
  title: string;
  summary?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      {back && (
        <Link
          href={back.href}
          className="self-start text-sm text-cf-primary underline underline-offset-4"
        >
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-1">
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">{title}</h1>
        {summary && <p className="text-cf-text-secondary">{summary}</p>}
      </div>
      {children}
    </header>
  );
}

/** Abas/filtros por link (cada opção é uma URL), com o item atual anunciado. */
export function LinkTabs({
  label,
  items,
  current,
}: {
  label: string;
  items: readonly { value: string; label: string; href: string }[];
  current: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-x-6 gap-y-1 border-b border-cf-border">
        {items.map((item) => {
          const active = item.value === current;
          return (
            <li key={item.value}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center border-b-2 text-sm',
                  active
                    ? 'border-cf-primary font-medium text-cf-text'
                    : 'border-transparent text-cf-text-secondary hover:text-cf-text',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
