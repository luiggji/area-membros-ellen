/**
 * Dados FICTÍCIOS do protótipo de homologação (CF-169). Servem só para Ellen visualizar a
 * composição v1.1 (doc G §4.1); toda tela marca esses dados como exemplo. Nada daqui pode ser
 * importado fora de `modules/prototype` nem chegar a produção.
 */

export type NavIcon =
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
  | 'help';

export interface NavItem {
  slug: string;
  label: string;
  icon: NavIcon;
  /** Item do backlog que entrega a tela real. */
  deliveredBy: string;
}

/** Primeiro nível: no máximo 6 destinos (doc G §3). */
export const primaryNav: readonly NavItem[] = [
  { slug: '', label: 'Início', icon: 'home', deliveredBy: 'CF-101' },
  { slug: 'jornada', label: 'Minha Jornada', icon: 'journey', deliveredBy: 'CF-102' },
  { slug: 'cursos', label: 'Cursos', icon: 'courses', deliveredBy: 'CF-082' },
  { slug: 'comunidade', label: 'Comunidade', icon: 'community', deliveredBy: 'CF-093' },
  { slug: 'cafe', label: 'Café Estratégico', icon: 'cafe', deliveredBy: 'CF-062' },
  { slug: 'assinatura', label: 'Assinatura', icon: 'subscription', deliveredBy: 'CF-047' },
];

/** Agrupados em "Mais". */
export const moreNav: readonly NavItem[] = [
  { slug: 'conexoes', label: 'Conexões', icon: 'connections', deliveredBy: 'CF-090' },
  { slug: 'ao-vivo', label: 'Ao Vivo', icon: 'live', deliveredBy: 'CF-104' },
  { slug: 'cofre', label: 'Cofre de Materiais', icon: 'vault', deliveredBy: 'CF-085' },
  { slug: 'planejamento', label: 'Meu Planejamento', icon: 'planning', deliveredBy: 'CF-103' },
  { slug: 'ajuda', label: 'Ajuda', icon: 'help', deliveredBy: 'CF-107' },
];

export function findSection(slug: string): NavItem | undefined {
  return [...primaryNav, ...moreNav].find((item) => item.slug === slug && slug !== '');
}

/** Variações da home que Ellen precisa homologar (doc G §4.1 "Variações"). */
export type HomeVariant = 'jornada' | 'novo';

export function parseHomeVariant(value: unknown): HomeVariant {
  return value === 'novo' ? 'novo' : 'jornada';
}

export interface ExampleCourse {
  slug: string;
  title: string;
  summary: string;
  icon: 'play' | 'users' | 'chart';
}

/** Títulos da referência aprovada, usados só como exemplo de composição. */
export const exampleCourses: readonly ExampleCourse[] = [
  {
    slug: 'comece-aqui',
    title: 'Comece Aqui',
    summary: 'Entenda o método, a plataforma e dê o primeiro passo.',
    icon: 'play',
  },
  {
    slug: 'primeiros-clientes',
    title: 'Primeiros Clientes',
    summary: 'Estratégias práticas para atrair e conquistar os primeiros clientes.',
    icon: 'users',
  },
  {
    slug: 'atendimento-e-conversao',
    title: 'Atendimento e Conversão',
    summary: 'Do primeiro contato ao fechamento, com segurança e estratégia.',
    icon: 'chart',
  },
];

export const exampleJourney = {
  title: 'Da Técnica à Liberdade',
  summary: 'Construa uma advocacia estratégica e com propósito.',
  completedModules: 3,
  totalModules: 8,
} as const;

/** Limites de densidade da home (doc G §4.1): 1 hero + 1 jornada + ≤ 3 cursos + ≤ 2 auxiliares. */
export const HOME_LIMITS = { courses: 3, auxiliaryCards: 2 } as const;
