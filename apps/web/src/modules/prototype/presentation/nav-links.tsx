import { SidebarLink } from '@/modules/navigation/presentation/sidebar-link';

import { adminNav } from '../domain/fixtures';

export const PROTOTYPE_BASE = '/prototipo';
export const TEAM_PROTOTYPE_HREF = `${PROTOTYPE_BASE}/equipe`;

export function hrefFor(slug: string): string {
  return slug ? `${PROTOTYPE_BASE}/${slug}` : PROTOTYPE_BASE;
}

/** Navegação do painel da equipe: cada item leva ao bloco que explica qual Issue o entrega. */
export function TeamNavLinks() {
  return (
    <nav aria-label="Navegação da equipe" className="flex flex-col gap-1">
      {adminNav.map((item) => (
        <SidebarLink
          key={item.slug}
          href={item.slug ? `${TEAM_PROTOTYPE_HREF}#${item.slug}` : TEAM_PROTOTYPE_HREF}
          icon={item.icon}
          label={item.label}
          active={item.slug === ''}
        />
      ))}
    </nav>
  );
}
