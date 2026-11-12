import Link from 'next/link';

export type CommunityTab = 'publicacoes' | 'grupos';

export function parseCommunityTab(value: unknown): CommunityTab {
  return value === 'grupos' ? 'grupos' : 'publicacoes';
}

const TABS = [
  { value: 'publicacoes', label: 'Publicações', href: '/app/comunidade' },
  { value: 'grupos', label: 'Grupos', href: '/app/comunidade?aba=grupos' },
  { value: 'conexoes', label: 'Conexões', href: '/app/conexoes' },
] as const;

/** Abas por link (doc G §4.4): cada opção é uma URL, e a atual é anunciada para o leitor de tela. */
export function CommunityTabs({ current }: { current: CommunityTab }) {
  return (
    <nav aria-label="Seções da comunidade">
      <ul className="flex flex-wrap gap-x-6 gap-y-1 border-b border-cf-border">
        {TABS.map((tab) => {
          const active = tab.value === current;
          return (
            <li key={tab.value}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 text-sm ${
                  active
                    ? 'border-cf-primary font-medium text-cf-text'
                    : 'border-transparent text-cf-text-secondary hover:text-cf-text'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
