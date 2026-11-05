'use client';

import { cn } from '@caixa-forte/ui';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BrandMark } from '@/shared/ui/brand-mark';

import { activeSlug, mobileBarNav, type NavBase, navHref } from '../domain/member-nav';
import { MemberNavList } from './member-nav-list';
import { NavDrawer } from './nav-drawer';
import { NavIcon } from './nav-icon';

const itemClasses =
  'flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[0.7rem] text-cf-text-secondary hover:text-cf-primary';

/** Barra inferior mobile (kit V2): 4 destinos com rótulo + "Mais", que abre o menu completo. */
export function MobileBar({ base }: { base: NavBase }) {
  const current = activeSlug(usePathname(), base);
  const inBar = mobileBarNav();
  const moreActive = current !== undefined && !inBar.some((item) => item.slug === current);

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cf-border bg-cf-surface px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-card"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {inBar.map((item) => {
          const active = item.slug === current;
          return (
            <li key={item.slug} className="flex flex-1">
              <Link
                href={navHref(item, base)}
                aria-current={active ? 'page' : undefined}
                className={cn(itemClasses, active && 'font-semibold text-cf-primary')}
              >
                <NavIcon name={item.icon} className="size-5" />
                {item.shortLabel ?? item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <NavDrawer
            triggerClassName={cn(itemClasses, moreActive && 'font-semibold text-cf-primary')}
            trigger={
              <>
                <Menu aria-hidden className="size-5" strokeWidth={1.6} />
                Mais
              </>
            }
          >
            <BrandMark variant="sidebar" className="px-2" />
            <MemberNavList base={base} variant="drawer" />
          </NavDrawer>
        </li>
      </ul>
    </nav>
  );
}
