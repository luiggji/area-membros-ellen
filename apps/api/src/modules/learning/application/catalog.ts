import { Catalog, CourseDetail } from '@caixa-forte/contracts';

import { resumeOf } from '../domain/progress';
import { catalogState, isReleased, Publication } from '../domain/publication';
import { ProgressStore } from './progress';

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
 * Página do curso: só módulos e aulas liberados, com o progresso de quem vê (concluídas e por
 * onde seguir). Curso programado mostra a data e nenhuma aula; fora do catálogo, `null`.
 */
export async function findCourse(
  deps: { reader: CatalogReader; progress: ProgressStore },
  slug: string,
  viewerId: string,
  now: Date,
): Promise<CourseDetail | null> {
  const { reader } = deps;
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
  const lessons = modules.flatMap((module) => module.lessons);
  const rows = lessons.length
    ? await deps.progress.forLessons(
        viewerId,
        lessons.map((lesson) => lesson.id),
      )
    : [];
  const done = new Set(rows.filter((row) => row.completedAt).map((row) => row.lessonId));
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    ...state,
    modules: modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({ ...lesson, completed: done.has(lesson.id) })),
    })),
    resume: resumeOf(lessons, rows),
  };
}
