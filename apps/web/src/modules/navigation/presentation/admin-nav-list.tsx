'use client';

import { usePathname } from 'next/navigation';

import { activeAdminSlug, adminHref, type AdminNavItem } from '../domain/admin-nav';
import { SidebarLink } from './sidebar-link';

/** Lista do painel da equipe; os itens já chegam filtrados pelo papel no servidor. */
export function AdminNavList({ items }: { items: readonly AdminNavItem[] }) {
  const current = activeAdminSlug(usePathname());
  return (
    <nav aria-label="Navegação da equipe" className="flex flex-col gap-1">
      {items.map((item) => (
        <SidebarLink
          key={item.slug}
          href={adminHref(item)}
          icon={item.icon}
          label={item.label}
          active={item.slug === current}
        />
      ))}
    </nav>
  );
}
