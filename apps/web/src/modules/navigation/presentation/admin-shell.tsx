import { AppShell } from '@caixa-forte/ui';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrandMark } from '@/shared/ui/brand-mark';

import type { AdminNavItem } from '../domain/admin-nav';
import { AdminNavList } from './admin-nav-list';
import { NavDrawer } from './nav-drawer';

function TeamLabel() {
  return (
    <span className="px-2 text-[0.7rem] font-medium tracking-[0.24em] text-champagne-500 uppercase">
      Painel da equipe
    </span>
  );
}

/**
 * Shell do painel da equipe (doc G §4.9): mesmo esqueleto do membro, navegação própria e largura
 * para tabelas. Os itens chegam filtrados pelo papel; cada página repete a portaria.
 */
export function AdminShell({
  items,
  banner,
  topbarEnd,
  children,
}: {
  items: readonly AdminNavItem[];
  banner?: ReactNode;
  topbarEnd: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell
      width="wide"
      banner={banner}
      sidebar={
        <>
          <div className="flex flex-col gap-3">
            <Link href="/admin" className="px-2">
              <BrandMark variant="sidebar" priority />
              <span className="sr-only">Visão geral da equipe</span>
            </Link>
            <TeamLabel />
          </div>
          <AdminNavList items={items} />
        </>
      }
      topbar={
        <>
          <div className="flex items-center gap-2 lg:hidden">
            <NavDrawer
              triggerClassName="grid size-11 place-items-center rounded-full text-cf-sidebar hover:bg-cf-surface-muted"
              trigger={
                <>
                  <Menu aria-hidden className="size-6" strokeWidth={1.6} />
                  <span className="sr-only">Abrir menu</span>
                </>
              }
            >
              <BrandMark variant="sidebar" className="px-2" />
              <TeamLabel />
              <AdminNavList items={items} />
            </NavDrawer>
            <Link href="/admin">
              <BrandMark variant="compact" />
              <span className="sr-only">Visão geral da equipe</span>
            </Link>
          </div>
          <div className="ms-auto flex items-center gap-1 sm:gap-3">{topbarEnd}</div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
