import { can, type Permission, type Role } from '@caixa-forte/contracts';

import type { NavIconName } from './member-nav';

/**
 * Navegação do painel da equipe (doc G §4.9). Cada item aparece só para o papel com a permissão
 * (a página e a API conferem de novo). `demo`: a tela ainda não tem versão real e só existe no
 * modo demonstração (CF-176/CF-177).
 */
export interface AdminNavItem {
  slug: string;
  label: string;
  icon: NavIconName;
  permission: Permission;
  demo?: boolean;
}

export const adminNav: readonly AdminNavItem[] = [
  { slug: '', label: 'Visão geral', icon: 'overview', permission: 'admin.access' },
  {
    slug: 'eventos',
    label: 'Eventos e lotes',
    icon: 'events',
    permission: 'events.manage',
    demo: true,
  },
  {
    slug: 'checkin',
    label: 'Check-in',
    icon: 'checkin',
    permission: 'checkin.perform',
    demo: true,
  },
  { slug: 'conteudo', label: 'Conteúdo', icon: 'content', permission: 'content.manage' },
  { slug: 'materiais', label: 'Cofre de materiais', icon: 'vault', permission: 'content.manage' },
  {
    slug: 'moderacao',
    label: 'Moderação',
    icon: 'moderation',
    permission: 'content.manage',
    demo: true,
  },
  { slug: 'planos', label: 'Planos e preços', icon: 'prices', permission: 'prices.manage' },
  { slug: 'acessos', label: 'Acessos concedidos', icon: 'access', permission: 'access.grant' },
  {
    slug: 'relatorios',
    label: 'Relatórios',
    icon: 'reports',
    permission: 'finance.read',
    demo: true,
  },
];

export function adminHref(item: AdminNavItem): string {
  return item.slug ? `/admin/${item.slug}` : '/admin';
}

/** Itens que o papel pode usar; os de demonstração só com o modo ligado. */
export function visibleAdminNav(roles: readonly Role[], demo: boolean): AdminNavItem[] {
  return adminNav.filter((item) => can(roles, item.permission) && (demo || !item.demo));
}

/** Tela de demonstração permitida para o papel (rota `/admin/[...rest]`). */
export function findAdminDemo(slug: string, roles: readonly Role[]): AdminNavItem | undefined {
  return adminNav.find((item) => item.demo && item.slug === slug && can(roles, item.permission));
}

/** Item ativo: a visão geral só na raiz exata; os demais também nas subpáginas. */
export function activeAdminSlug(pathname: string): string | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return adminNav.find((item) => {
    const href = adminHref(item);
    return item.slug === '' ? path === href : path === href || path.startsWith(`${href}/`);
  })?.slug;
}
