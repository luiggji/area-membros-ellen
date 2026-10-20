import { cn } from '@caixa-forte/ui';
import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrandMark, hrefFor, NavLinks, PROTOTYPE_BASE } from './nav-links';
import { MobileNav } from './mobile-nav';

/** Faixa fixa que impede o protótipo de ser confundido com a plataforma real. */
function PrototypeNotice() {
  return (
    <div className="bg-blush-200 px-4 py-2 text-center text-xs text-ink sm:text-sm">
      <strong className="font-semibold">Protótipo de homologação</strong> · dados, textos e imagens
      são exemplos fictícios · não é a plataforma real (CF-169)
      <span className="mx-2 hidden sm:inline">·</span>
      <span className="block sm:inline">
        Ver como:{' '}
        <Link className="underline underline-offset-2" href={PROTOTYPE_BASE}>
          membro em jornada
        </Link>{' '}
        |{' '}
        <Link className="underline underline-offset-2" href={`${PROTOTYPE_BASE}?estado=novo`}>
          novo membro
        </Link>
      </span>
    </div>
  );
}

/** Avatar sem foto: placeholder não personalizado (doc G §4.5). */
function MemberGreeting() {
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full bg-blush-200 font-medium text-cf-primary"
      >
        M
      </span>
      <span className="hidden text-sm text-cf-text sm:inline">Olá, Membro</span>
    </span>
  );
}

function IconButton({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      title={`${label} — entra em uma Issue futura`}
      className={cn(
        'grid size-11 place-items-center rounded-full text-cf-text-secondary disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
      <span className="sr-only">{label} (indisponível no protótipo)</span>
    </button>
  );
}

export function PrototypeShell({
  activeSlug,
  children,
}: {
  activeSlug: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PrototypeNotice />
      <div className="flex flex-1">
        <aside className="hidden w-(--spacing-sidebar) shrink-0 flex-col gap-12 bg-cf-sidebar px-5 py-10 lg:flex">
          <Link href={hrefFor('')} className="px-4">
            <BrandMark />
            <span className="sr-only">Início</span>
          </Link>
          <NavLinks activeSlug={activeSlug} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-18 items-center justify-between gap-4 px-4 sm:px-8 lg:justify-end lg:px-12">
            <div className="flex items-center gap-2 lg:hidden">
              <MobileNav>
                <BrandMark className="px-4" />
                <NavLinks activeSlug={activeSlug} />
              </MobileNav>
              <Link
                href={hrefFor('')}
                className="font-editorial text-base tracking-[0.12em] whitespace-nowrap text-cf-sidebar uppercase sm:text-lg sm:tracking-[0.18em]"
              >
                Caixa Forte
              </Link>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <IconButton label="Buscar">
                <Search aria-hidden className="size-5" strokeWidth={1.6} />
              </IconButton>
              <IconButton label="Avisos" className="max-sm:hidden">
                <Bell aria-hidden className="size-5" strokeWidth={1.6} />
              </IconButton>
              <MemberGreeting />
            </div>
          </header>

          <main className="mx-auto w-full max-w-(--spacing-content-max) flex-1 px-4 pb-16 sm:px-8 lg:px-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
