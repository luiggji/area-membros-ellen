import { AppShell, Button } from '@caixa-forte/ui';
import { Bell, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { MemberShell } from '@/modules/navigation/presentation/member-shell';
import { NavDrawer } from '@/modules/navigation/presentation/nav-drawer';
import { BrandMark } from '@/shared/ui/brand-mark';

import { PROTOTYPE_BASE, TEAM_PROTOTYPE_HREF, TeamNavLinks } from './nav-links';

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
        </Link>{' '}
        |{' '}
        <Link className="underline underline-offset-2" href={TEAM_PROTOTYPE_HREF}>
          equipe
        </Link>
      </span>
    </div>
  );
}

/** Avatar sem foto: placeholder não personalizado (doc G §4.5). */
function Greeting({ initial, name }: { initial: string; name: string }) {
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full bg-blush-200 font-medium text-cf-primary"
      >
        {initial}
      </span>
      <span className="hidden text-sm text-cf-text sm:inline">{name}</span>
    </span>
  );
}

function UnavailableIconButton({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      title={`${label} — entra em uma Issue futura`}
      className={className}
    >
      {children}
      <span className="sr-only">{label} (indisponível no protótipo)</span>
    </Button>
  );
}

/** Busca, avisos e saudação: indisponíveis no protótipo, com motivo (doc G §5). */
function TopbarActions({ greeting }: { greeting: ReactNode }) {
  return (
    <>
      <UnavailableIconButton label="Buscar">
        <Search aria-hidden className="size-5" strokeWidth={1.6} />
      </UnavailableIconButton>
      <UnavailableIconButton label="Avisos" className="max-sm:hidden">
        <Bell aria-hidden className="size-5" strokeWidth={1.6} />
      </UnavailableIconButton>
      {greeting}
    </>
  );
}

function SidebarBrand({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-2">
      <BrandMark variant="sidebar" priority />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Área do membro com o shell definitivo (CF-021) apontando para as rotas do protótipo. */
export function PrototypeShell({ children }: { children: ReactNode }) {
  return (
    <MemberShell
      base={PROTOTYPE_BASE}
      banner={<PrototypeNotice />}
      topbarEnd={<TopbarActions greeting={<Greeting initial="M" name="Olá, Membro" />} />}
    >
      {children}
    </MemberShell>
  );
}

/** Painel da equipe (doc G §4.9): mesmo esqueleto, navegação própria e largura para tabelas. */
export function TeamPrototypeShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      width="wide"
      banner={<PrototypeNotice />}
      sidebar={
        <>
          <div className="flex flex-col gap-3">
            <SidebarBrand href={TEAM_PROTOTYPE_HREF} label="Visão geral da equipe" />
            <span className="px-2 text-[0.7rem] font-medium tracking-[0.24em] text-champagne-500 uppercase">
              Painel da equipe
            </span>
          </div>
          <TeamNavLinks />
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
              <TeamNavLinks />
            </NavDrawer>
            <Link href={TEAM_PROTOTYPE_HREF}>
              <BrandMark variant="compact" />
            </Link>
          </div>
          <div className="ms-auto flex items-center gap-1 sm:gap-3">
            <TopbarActions greeting={<Greeting initial="E" name="Equipe" />} />
          </div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
