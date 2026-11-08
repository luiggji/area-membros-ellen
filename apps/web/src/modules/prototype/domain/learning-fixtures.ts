/**
 * Conteúdo FICTÍCIO das telas de aprendizado do protótipo (CF-174): catálogo, curso, aula, Cofre,
 * jornada e planejamento. Títulos, aulas, materiais e progresso são exemplos para Ellen avaliar
 * composição e hierarquia; toda tela exibe a faixa do protótipo e o selo "Exemplo".
 */

import { exampleCourses, type ExampleCourse } from './fixtures';

export interface ExampleLesson {
  id: string;
  title: string;
  kind: 'Vídeo' | 'Leitura' | 'Exercício';
  minutes: number;
  completed?: boolean;
  free?: boolean;
}

export interface ExampleModule {
  title: string;
  lessons: readonly ExampleLesson[];
}

export interface ExampleCatalogCourse extends ExampleCourse {
  /** Só cursos disponíveis têm módulos; programado mostra a data de exemplo. */
  modules: readonly ExampleModule[];
  scheduledFor?: string;
}

const lesson = (id: string, title: string, kind: ExampleLesson['kind'], minutes: number) => ({
  id,
  title,
  kind,
  minutes,
});

/** Catálogo completo de exemplo: os 3 cursos da home + 2 extras (o catálogo não tem limite). */
export const catalogCourses: readonly ExampleCatalogCourse[] = [
  {
    ...exampleCourses[0]!,
    modules: [
      {
        title: 'Boas-vindas',
        lessons: [
          { ...lesson('cc-1', 'Como a Caixa Forte funciona', 'Vídeo', 8), completed: true },
          { ...lesson('cc-2', 'Seu diagnóstico inicial', 'Exercício', 15), completed: true },
        ],
      },
      {
        title: 'Primeiro plano',
        lessons: [
          lesson('cc-3', 'Definindo o objetivo de 90 dias', 'Vídeo', 14),
          lesson('cc-4', 'Três ações para os próximos 30 dias', 'Leitura', 6),
        ],
      },
    ],
  },
  {
    ...exampleCourses[1]!,
    modules: [
      {
        title: 'Posicionamento',
        lessons: [
          { ...lesson('pc-1', 'Quem você quer atender', 'Vídeo', 18), free: true },
          lesson('pc-2', 'Sua apresentação profissional', 'Vídeo', 12),
          lesson('pc-3', 'Roteiro de apresentação', 'Exercício', 20),
        ],
      },
      {
        title: 'Oportunidades',
        lessons: [
          lesson('pc-4', 'Indicações com ética', 'Vídeo', 16),
          lesson('pc-5', 'Presença em eventos jurídicos', 'Leitura', 7),
        ],
      },
    ],
  },
  { ...exampleCourses[2]!, modules: [], scheduledFor: 'Programado para 03/12 (exemplo)' },
  {
    slug: 'honorarios',
    title: 'Honorários com Segurança',
    summary: 'Como precificar, apresentar e formalizar sua proposta.',
    status: 'disponivel',
    icon: 'diamond',
    modules: [
      {
        title: 'Precificação',
        lessons: [
          lesson('ho-1', 'Tabela da OAB como ponto de partida', 'Vídeo', 15),
          lesson('ho-2', 'Contrato de honorários', 'Leitura', 10),
        ],
      },
    ],
  },
  {
    slug: 'rotina-do-escritorio',
    title: 'Rotina do Escritório',
    summary: 'Agenda, prazos e organização para trabalhar com clareza.',
    status: 'programado',
    icon: 'pen',
    modules: [],
    scheduledFor: 'Em preparação',
  },
];

export type CatalogFilter = 'todos' | 'disponiveis' | 'programados';

export function parseCatalogFilter(value: unknown): CatalogFilter {
  return value === 'disponiveis' || value === 'programados' ? value : 'todos';
}

export function filterCourses(filter: CatalogFilter): ExampleCatalogCourse[] {
  if (filter === 'todos') return [...catalogCourses];
  const status = filter === 'disponiveis' ? 'disponivel' : 'programado';
  return catalogCourses.filter((course) => course.status === status);
}

export function findCourse(slug: string): ExampleCatalogCourse | undefined {
  return catalogCourses.find((course) => course.slug === slug);
}

/** Aula com o curso e a vizinhança (anterior/próxima) na ordem dos módulos. */
export function findLesson(id: string) {
  for (const course of catalogCourses) {
    const lessons = course.modules.flatMap((module) =>
      module.lessons.map((item) => ({ ...item, module: module.title })),
    );
    const index = lessons.findIndex((item) => item.id === id);
    if (index >= 0) {
      return {
        course,
        lesson: lessons[index]!,
        previous: lessons[index - 1],
        next: lessons[index + 1],
      };
    }
  }
  return undefined;
}

export interface ExampleMaterial {
  title: string;
  category: 'Modelos' | 'Checklists' | 'Guias';
  format: 'PDF' | 'DOCX';
  size: string;
  course?: string;
}

export const exampleMaterials: readonly ExampleMaterial[] = [
  {
    title: 'Modelo de contrato de honorários',
    category: 'Modelos',
    format: 'DOCX',
    size: '48 KB',
    course: 'Honorários com Segurança',
  },
  { title: 'Modelo de proposta de serviços', category: 'Modelos', format: 'DOCX', size: '36 KB' },
  {
    title: 'Checklist do primeiro atendimento',
    category: 'Checklists',
    format: 'PDF',
    size: '120 KB',
    course: 'Atendimento e Conversão',
  },
  { title: 'Checklist de prazos da semana', category: 'Checklists', format: 'PDF', size: '90 KB' },
  {
    title: 'Guia de posicionamento profissional',
    category: 'Guias',
    format: 'PDF',
    size: '1,2 MB',
    course: 'Primeiros Clientes',
  },
];

export const MATERIAL_CATEGORIES = ['Modelos', 'Checklists', 'Guias'] as const;

/** Stepper da jornada (doc G §4.6): diagnóstico → objetivo de 90 dias → ações de 30 dias. */
export const journeySteps = [
  { slug: 'diagnostico', label: 'Diagnóstico', summary: 'Onde você está hoje.' },
  { slug: 'objetivo', label: 'Objetivo de 90 dias', summary: 'Aonde quer chegar.' },
  { slug: 'acoes', label: 'Ações de 30 dias', summary: 'O que fazer agora.' },
] as const;

export type JourneyStep = (typeof journeySteps)[number]['slug'];

export function parseJourneyStep(value: unknown): JourneyStep {
  return journeySteps.find((step) => step.slug === value)?.slug ?? 'diagnostico';
}

export const diagnosticQuestion = {
  legend: 'Há quanto tempo você advoga?',
  options: [
    { value: 'inicio', label: 'Menos de 2 anos', description: 'Começando a carreira.' },
    { value: 'transicao', label: 'De 2 a 5 anos', description: 'Estruturando a prática.' },
    { value: 'consolidado', label: 'Mais de 5 anos', description: 'Buscando o próximo nível.' },
  ],
} as const;

export const examplePlan = {
  goal: 'Fechar 5 novos contratos de honorários com clientes de Família.',
  deadline: 'até 28/02 (exemplo)',
  actions: [
    { title: 'Revisar minha apresentação profissional', done: true },
    { title: 'Participar de 1 evento jurídico da cidade', done: false },
    { title: 'Pedir 3 indicações a clientes satisfeitos', done: false },
  ],
} as const;
