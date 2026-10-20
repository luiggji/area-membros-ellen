/**
 * Dados FICTÍCIOS do protótipo de homologação (CF-169). Servem só para Ellen visualizar a
 * composição v1.1 (doc G §4.1); toda tela marca esses dados como exemplo. Nada daqui pode ser
 * importado fora de `modules/prototype` nem chegar a produção.
 */

import { allMemberNav, type NavItem } from '@/modules/navigation/domain/member-nav';

/**
 * Painel da equipe (doc G §4.9): navegação própria, sem o limite de densidade da home.
 * Os papéis (owner/comercial) e o bloqueio das rotas chegam com CF-032 e CF-034.
 */
export const adminNav: readonly NavItem[] = [
  { slug: '', label: 'Visão geral', icon: 'overview', deliveredBy: 'CF-105' },
  { slug: 'eventos', label: 'Eventos e lotes', icon: 'events', deliveredBy: 'CF-061' },
  { slug: 'checkin', label: 'Check-in', icon: 'checkin', deliveredBy: 'CF-068' },
  { slug: 'conteudo', label: 'Conteúdo', icon: 'content', deliveredBy: 'CF-081' },
  { slug: 'moderacao', label: 'Moderação', icon: 'moderation', deliveredBy: 'CF-095' },
  { slug: 'relatorios', label: 'Relatórios', icon: 'reports', deliveredBy: 'CF-106' },
];

/** Destino da navegação do membro (a home tem rota própria). */
export function findSection(slug: string): NavItem | undefined {
  return allMemberNav.find((item) => item.slug === slug && slug !== '');
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
