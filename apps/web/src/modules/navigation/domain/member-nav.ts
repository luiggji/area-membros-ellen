/**
 * Navegação da área do membro (CF-021; doc G §3 e `docs/brand/v2/06_SCREEN_BLUEPRINTS/NAVIGATION_MAP.md`).
 * Fonte única para sidebar, barra inferior mobile e drawer: nenhuma tela P0 fica sem caminho.
 */

export type NavIconName =
  | 'home'
  | 'journey'
  | 'courses'
  | 'community'
  | 'cafe'
  | 'subscription'
  | 'connections'
  | 'live'
  | 'vault'
  | 'planning'
  | 'help'
  | 'overview'
  | 'events'
  | 'checkin'
  | 'content'
  | 'moderation'
  | 'reports';

export interface NavItem {
  slug: string;
  label: string;
  /** Rótulo curto da barra inferior mobile. */
  shortLabel?: string;
  icon: NavIconName;
  /** Item do backlog que entrega a tela real. */
  deliveredBy: string;
  /** Destino público na área real (o Café tem página própria, acessível sem login). */
  publicHref?: string;
}

/** Raiz da área do membro: `/app` em produção, `/prototipo` na rota de homologação. */
export type NavBase = '/app' | '/prototipo';

/** Primeiro nível: no máximo 6 destinos (doc G §3). */
export const primaryNav: readonly NavItem[] = [
  { slug: '', label: 'Início', icon: 'home', deliveredBy: 'CF-101' },
  {
    slug: 'jornada',
    label: 'Minha Jornada',
    shortLabel: 'Jornada',
    icon: 'journey',
    deliveredBy: 'CF-102',
  },
  { slug: 'cursos', label: 'Cursos', icon: 'courses', deliveredBy: 'CF-082' },
  { slug: 'comunidade', label: 'Comunidade', icon: 'community', deliveredBy: 'CF-093' },
  {
    slug: 'cafe',
    label: 'Café Estratégico',
    shortLabel: 'Café',
    icon: 'cafe',
    deliveredBy: 'CF-062',
    publicHref: '/eventos',
  },
  { slug: 'assinatura', label: 'Assinatura', icon: 'subscription', deliveredBy: 'CF-047' },
];

/** Agrupados em "Mais": continuam P0, só saem do primeiro nível visual. */
export const moreNav: readonly NavItem[] = [
  { slug: 'conexoes', label: 'Conexões', icon: 'connections', deliveredBy: 'CF-090' },
  { slug: 'ao-vivo', label: 'Ao Vivo', icon: 'live', deliveredBy: 'CF-104' },
  { slug: 'cofre', label: 'Cofre de Materiais', icon: 'vault', deliveredBy: 'CF-085' },
  { slug: 'planejamento', label: 'Meu Planejamento', icon: 'planning', deliveredBy: 'CF-103' },
  { slug: 'ajuda', label: 'Ajuda', icon: 'help', deliveredBy: 'CF-107' },
];

/** Barra inferior mobile: 4 destinos + "Mais" (doc G §3, NAVIGATION_MAP do kit). */
const MOBILE_BAR_SLUGS = ['', 'cursos', 'comunidade', 'cafe'] as const;

export const NAV_LIMITS = { primary: 6, mobileBar: 4 } as const;

export const allMemberNav: readonly NavItem[] = [...primaryNav, ...moreNav];

export function mobileBarNav(): NavItem[] {
  return MOBILE_BAR_SLUGS.map((slug) => primaryNav.find((item) => item.slug === slug)!);
}

/** O que não cabe na barra inferior fica no drawer aberto por "Mais". */
export function drawerNav(): NavItem[] {
  const inBar = new Set<string>(MOBILE_BAR_SLUGS);
  return allMemberNav.filter((item) => !inBar.has(item.slug));
}

export function navHref(item: NavItem, base: NavBase): string {
  if (base === '/app' && item.publicHref) return item.publicHref;
  return item.slug ? `${base}/${item.slug}` : base;
}

/** Slug do item ativo para a URL atual; a home só é ativa na raiz exata. */
export function activeSlug(pathname: string, base: NavBase): string | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return allMemberNav.find((item) => {
    const href = navHref(item, base);
    return item.slug === '' ? path === href : path === href || path.startsWith(`${href}/`);
  })?.slug;
}
