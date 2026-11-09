/**
 * Dados FICTÍCIOS do modo demonstração (CF-169/CF-177). Servem só para Ellen visualizar a
 * composição v1.1 (doc G §4.1); toda tela marca esses dados como exemplo. Nada daqui pode ser
 * importado fora de `modules/demo`; o modo demonstração nunca liga em produção.
 */

/** Variações da home que Ellen precisa homologar (doc G §4.1 "Variações"). */
export type HomeVariant = 'jornada' | 'novo';

export function parseHomeVariant(value: unknown): HomeVariant {
  return value === 'novo' ? 'novo' : 'jornada';
}

export interface ExampleCourse {
  slug: string;
  title: string;
  summary: string;
  status: 'disponivel' | 'programado';
  icon: 'diamond' | 'spark' | 'pen';
}

/** Títulos e resumos da prévia do Brand System V2, só como exemplo de composição. */
export const exampleCourses: readonly ExampleCourse[] = [
  {
    slug: 'comece-aqui',
    title: 'Comece Aqui',
    summary: 'Por onde começar sua jornada estratégica.',
    status: 'disponivel',
    icon: 'diamond',
  },
  {
    slug: 'primeiros-clientes',
    title: 'Primeiros Clientes',
    summary: 'Posicionamento e oportunidades profissionais.',
    status: 'disponivel',
    icon: 'spark',
  },
  {
    slug: 'atendimento-e-conversao',
    title: 'Atendimento e Conversão',
    summary: 'Do primeiro contato à proposta de honorários.',
    status: 'programado',
    icon: 'pen',
  },
];

export const exampleJourney = {
  title: 'Da Técnica à Liberdade',
  summary: 'Seu caminho para uma advocacia mais estratégica.',
} as const;

/** Limites de densidade da home (doc G §4.1): 1 hero + 1 jornada + ≤ 3 cursos + ≤ 2 auxiliares. */
export const HOME_LIMITS = { courses: 3, auxiliaryCards: 2 } as const;
