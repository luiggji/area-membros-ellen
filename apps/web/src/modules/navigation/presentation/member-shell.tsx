import { AppShell } from '@caixa-forte/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrandMark } from '@/shared/ui/brand-mark';

import type { NavBase } from '../domain/member-nav';
import { MemberNavList } from './member-nav-list';
import { MobileBar } from './mobile-bar';

/**
 * Shell da área do membro (CF-021): sidebar ameixa com até 6 destinos + "Mais" no desktop;
 * topbar com a marca compacta e barra inferior 4 + "Mais" no mobile. As ações da topbar
 * (busca, avisos, perfil) chegam de quem usa o shell — dados do usuário vêm do servidor.
 */
export function MemberShell({
  base = '/app',
  banner,
  topbarEnd,
  children,
}: {
  base?: NavBase;
  banner?: ReactNode;
  topbarEnd: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell
      banner={banner}
      sidebar={
        <>
          <Link href={base} className="px-2">
            <BrandMark variant="sidebar" priority />
            <span className="sr-only">Início</span>
          </Link>
          <MemberNavList base={base} />
        </>
      }
      topbar={
        <>
          <Link href={base} className="lg:hidden">
            <BrandMark variant="compact" />
            <span className="sr-only">Início</span>
          </Link>
          <div className="ms-auto flex items-center gap-1 sm:gap-3">{topbarEnd}</div>
        </>
      }
      bottomBar={<MobileBar base={base} />}
    >
      {children}
    </AppShell>
  );
}
