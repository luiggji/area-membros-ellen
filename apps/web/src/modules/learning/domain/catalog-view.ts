import type { CatalogCourse } from '@caixa-forte/contracts';

/** Filtros do catálogo (CF-082), na URL como `?estado=`. Valor desconhecido cai em "todos". */
export const CATALOG_FILTERS = {
  todos: 'Todos',
  disponiveis: 'Disponíveis',
  programados: 'Programados',
} as const;
export type CatalogFilter = keyof typeof CATALOG_FILTERS;

export function parseCatalogFilter(value: unknown): CatalogFilter {
  return typeof value === 'string' && value in CATALOG_FILTERS ? (value as CatalogFilter) : 'todos';
}

export function filterCatalog(courses: CatalogCourse[], filter: CatalogFilter): CatalogCourse[] {
  if (filter === 'todos') return courses;
  const wanted = filter === 'disponiveis' ? 'available' : 'scheduled';
  return courses.filter((course) => course.availability === wanted);
}

const brasiliaDate = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** "Programado para 03/11/2026" (data no horário de Brasília); disponível não leva rótulo. */
export function availabilityText(course: Pick<CatalogCourse, 'availability' | 'availableAt'>) {
  return course.availability === 'scheduled' && course.availableAt
    ? `Programado para ${brasiliaDate.format(new Date(course.availableAt))}`
    : undefined;
}

/** Frase verdadeira para a grade vazia, conforme o filtro. */
export function emptyCatalogText(filter: CatalogFilter): string {
  if (filter === 'disponiveis') return 'Nenhum curso disponível ainda.';
  if (filter === 'programados') return 'Nenhum curso programado no momento.';
  return 'Ainda não há cursos publicados. Quando o primeiro curso for publicado, ele aparece aqui.';
}
