import { cn } from '@caixa-forte/ui';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { adminNav, moreNav, type NavItem, primaryNav } from '../domain/fixtures';
import { NavIcon } from './nav-icon';

export const PROTOTYPE_BASE = '/prototipo';
export const TEAM_PROTOTYPE_HREF = `${PROTOTYPE_BASE}/equipe`;

export function hrefFor(slug: string): string {
  return slug ? `${PROTOTYPE_BASE}/${slug}` : PROTOTYPE_BASE;
}

function NavLink({ item, active, href }: { item: NavItem; active: boolean; href: string }) {
  return (
    <Link
      href={href}
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
        <NavLink
          key={item.slug}
          item={item}
          href={hrefFor(item.slug)}
          active={item.slug === activeSlug}
        />
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
            <NavLink
              key={item.slug}
              item={item}
              href={hrefFor(item.slug)}
              active={item.slug === activeSlug}
            />
          ))}
        </div>
      </details>
    </nav>
  );
}

/** Navegação do painel da equipe: cada item leva ao bloco que explica qual Issue o entrega. */
export function TeamNavLinks() {
  return (
    <nav aria-label="Navegação da equipe" className="flex flex-col gap-1">
      {adminNav.map((item) => (
        <NavLink
          key={item.slug}
          item={item}
          href={item.slug ? `${TEAM_PROTOTYPE_HREF}#${item.slug}` : TEAM_PROTOTYPE_HREF}
          active={item.slug === ''}
        />
      ))}
    </nav>
  );
}
