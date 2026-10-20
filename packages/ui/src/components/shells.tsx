import type { ReactNode } from 'react';

import { cn } from '../lib/cn.js';

export const MAIN_CONTENT_ID = 'conteudo';

/** Primeiro foco da página: pula a navegação direto para o conteúdo. */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-cf-surface focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-cf-primary"
    >
      Pular para o conteúdo
    </a>
  );
}

export interface AppShellProps {
  /** Conteúdo da barra lateral vinho (marca + navegação). Só aparece a partir de `lg`. */
  sidebar: ReactNode;
  /** Barra superior: no mobile carrega o menu e a marca; no desktop, busca/avisos/perfil. */
  topbar: ReactNode;
  /** Faixa acima do shell para avisos que não podem sumir (assinatura irregular, protótipo). */
  banner?: ReactNode;
  /** `reading` limita a largura (área do membro); `wide` dá espaço a tabelas (painel da equipe). */
  width?: 'reading' | 'wide';
  children: ReactNode;
}

/**
 * Shell das áreas logadas: sidebar vinho fixa à esquerda, canvas creme à direita (doc G §3).
 * Membro e equipe usam o mesmo esqueleto; muda a navegação e a largura do conteúdo.
 */
export function AppShell({ sidebar, topbar, banner, width = 'reading', children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      {banner}
      <div className="flex flex-1">
        <aside className="hidden w-(--spacing-sidebar) shrink-0 bg-cf-sidebar lg:block">
          <div className="sticky top-0 flex max-h-dvh flex-col gap-12 overflow-y-auto px-5 py-10">
            {sidebar}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-18 items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
            {topbar}
          </header>
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className={cn(
              'mx-auto w-full flex-1 px-4 pb-16 focus:outline-none sm:px-8 lg:px-12',
              width === 'reading' ? 'max-w-(--spacing-content-max)' : 'max-w-(--spacing-admin-max)',
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export interface PublicShellProps {
  /** Marca com link para a página inicial (o pacote não conhece o `Link` do Next). */
  brand: ReactNode;
  /** Ações do cabeçalho, ex.: "Entrar" e "Assinar". */
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Shell das páginas públicas (landing, planos, `/eventos/[slug]`): sem sidebar, mesma paleta. */
export function PublicShell({ brand, actions, footer, children }: PublicShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className="border-b border-cf-border">
        <div className="mx-auto flex h-18 max-w-(--spacing-content-max) items-center justify-between gap-4 px-4 sm:px-8">
          {brand}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-(--spacing-content-max) flex-1 flex-col px-4 focus:outline-none sm:px-8"
      >
        {children}
      </main>
      {footer && (
        <footer className="border-t border-cf-border">
          <div className="mx-auto max-w-(--spacing-content-max) px-4 py-8 text-sm text-cf-text-secondary sm:px-8">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}
