import { cn } from '@caixa-forte/ui';
import { ChevronDown, LockKeyhole } from 'lucide-react';
import Link from 'next/link';

import { moreNav, type NavItem, primaryNav } from '../domain/fixtures';
import { NavIcon } from './nav-icon';

export const PROTOTYPE_BASE = '/prototipo';

export function hrefFor(slug: string): string {
  return slug ? `${PROTOTYPE_BASE}/${slug}` : PROTOTYPE_BASE;
}

/** Marca tipográfica provisória: o cadeado da referência não é logo oficial (doc G §6, P-006). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-3 text-cream-50', className)}>
      <LockKeyhole aria-hidden className="size-7 text-champagne-500" strokeWidth={1.4} />
      <span className="font-editorial text-xl leading-none tracking-[0.18em] uppercase">
        Caixa Forte
      </span>
    </span>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={hrefFor(item.slug)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-xl px-4 text-[0.95rem] text-cream-50/80 transition-colors duration-200',
        'hover:bg-cream-50/8 hover:text-cream-50 focus-visible:outline-champagne-500',
        active && 'bg-cream-50/12 text-cream-50',
      )}
    >
      <NavIcon name={item.icon} className="size-5 shrink-0" />
      {item.label}
    </Link>
  );
}

/**
 * Navegação compartilhada pela sidebar (desktop) e pelo drawer (mobile).
 * "Mais" usa <details>: abre por teclado e leitor de tela sem JavaScript.
 */
export function NavLinks({ activeSlug }: { activeSlug: string }) {
  const moreIsActive = moreNav.some((item) => item.slug === activeSlug);
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {primaryNav.map((item) => (
        <NavLink key={item.slug} item={item} active={item.slug === activeSlug} />
      ))}
      <details className="group" open={moreIsActive}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-xl px-4 text-[0.95rem] text-cream-50/80 hover:bg-cream-50/8 hover:text-cream-50 focus-visible:outline-champagne-500 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            aria-hidden
            className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
            strokeWidth={1.6}
          />
          Mais
        </summary>
        <div className="mt-1 flex flex-col gap-1 pl-2 [&_a]:text-sm">
          {moreNav.map((item) => (
            <NavLink key={item.slug} item={item} active={item.slug === activeSlug} />
          ))}
        </div>
      </details>
    </nav>
  );
}
