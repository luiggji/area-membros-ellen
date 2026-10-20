'use client';

import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  activeSlug,
  moreNav,
  type NavBase,
  navHref,
  type NavItem,
  primaryNav,
} from '../domain/member-nav';
import { SidebarLink } from './sidebar-link';

/**
 * Lista da área do membro. Na sidebar, os itens secundários ficam em "Mais" (<details>: abre por
 * teclado e leitor de tela sem JS) e o grupo já vem aberto se a página atual estiver nele.
 * No drawer mobile, tudo aparece de uma vez, com um título discreto.
 */
export function MemberNavList({
  base,
  variant = 'sidebar',
}: {
  base: NavBase;
  variant?: 'sidebar' | 'drawer';
}) {
  const current = activeSlug(usePathname(), base);
  const link = (item: NavItem, nested = false) => (
    <SidebarLink
      key={item.slug}
      href={navHref(item, base)}
      icon={item.icon}
      label={item.label}
      active={item.slug === current}
      nested={nested}
    />
  );

  if (variant === 'drawer') {
    return (
      <nav aria-label="Menu completo" className="flex flex-col gap-1">
        {primaryNav.map((item) => link(item))}
        <p className="mt-4 px-4 pb-1 text-[0.7rem] font-medium tracking-[0.24em] text-champagne-500 uppercase">
          Mais
        </p>
        {moreNav.map((item) => link(item, true))}
      </nav>
    );
  }

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {primaryNav.map((item) => link(item))}
      <details className="group" open={moreNav.some((item) => item.slug === current)}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-md px-4 text-[0.95rem] text-cream-50/85 hover:bg-cream-50/8 hover:text-cream-50 focus-visible:outline-champagne-500 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            aria-hidden
            className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
            strokeWidth={1.6}
          />
          Mais
        </summary>
        <div className="mt-1 flex flex-col gap-1">{moreNav.map((item) => link(item, true))}</div>
      </details>
    </nav>
  );
}
