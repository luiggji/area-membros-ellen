import { Catalog, CourseDetail } from '@caixa-forte/contracts';

import { catalogState, isReleased, Publication } from '../domain/publication';

/** Linhas cruas lidas do banco em qualquer estado; o filtro de publicação é feito aqui. */
interface Ordered extends Publication {
  orderIndex: number;
  createdAt: string;
}

export interface CatalogLessonRow extends Ordered {
  id: string;
  title: string;
  kind: 'video' | 'text';
  durationMinutes: number | null;
  isFree: boolean;
}

export interface CatalogModuleRow extends Ordered {
  id: string;
  title: string;
  lessons: CatalogLessonRow[];
}

export interface CatalogCourseRow extends Ordered {
  slug: string;
  title: string;
  summary: string | null;
  track: Publication | null;
}

export interface CatalogReader {
  /** Cursos publicados ou agendados (rascunho nem sai do banco), com a trilha. */
  courses(): Promise<CatalogCourseRow[]>;
  course(slug: string): Promise<(CatalogCourseRow & { modules: CatalogModuleRow[] }) | null>;
}

export const CATALOG_READER = Symbol('CATALOG_READER');

const byOrder = (a: Ordered, b: Ordered) =>
  a.orderIndex - b.orderIndex || a.createdAt.localeCompare(b.createdAt);

/** Catálogo do membro: disponíveis e programados, na ordem definida pela owner. */
export async function listCatalog(reader: CatalogReader, now: Date): Promise<Catalog> {
  const courses = (await reader.courses()).sort(byOrder).flatMap((course) => {
    const state = catalogState(course, course.track, now);
    return state
      ? [{ slug: course.slug, title: course.title, summary: course.summary, ...state }]
      : [];
  });
  return { courses };
}

/**
 * Página do curso: só módulos e aulas liberados. Curso programado mostra a data e nenhuma aula;
 * fora do catálogo (rascunho ou inexistente), `null`.
 */
export async function findCourse(
  reader: CatalogReader,
  slug: string,
  now: Date,
): Promise<CourseDetail | null> {
  const course = await reader.course(slug);
  const state = course && catalogState(course, course.track, now);
  if (!course || !state) return null;
  const modules =
    state.availability === 'available'
      ? course.modules
          .filter((module) => isReleased(module, now))
          .sort(byOrder)
          .map((module) => ({
            id: module.id,
            title: module.title,
            lessons: module.lessons
              .filter((lesson) => isReleased(lesson, now))
              .sort(byOrder)
              .map(({ id, title, kind, durationMinutes, isFree }) => ({
                id,
                title,
                kind,
                durationMinutes,
                isFree,
              })),
          }))
      : [];
  return { slug: course.slug, title: course.title, summary: course.summary, ...state, modules };
}
