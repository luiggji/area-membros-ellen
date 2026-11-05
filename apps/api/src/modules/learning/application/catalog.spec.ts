import { describe, expect, it } from '@jest/globals';

import {
  CatalogCourseRow,
  CatalogModuleRow,
  CatalogReader,
  findCourse,
  listCatalog,
} from './catalog';
import { ProgressStore } from './progress';

const now = new Date('2026-10-28T12:00:00.000Z');
const soon = '2026-11-03T12:00:00.000Z';
const base = { createdAt: '2026-10-01T00:00:00.000Z', publishAt: null };
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const course = (
  slug: string,
  orderIndex: number,
  status: string,
  publishAt: string | null = null,
) =>
  ({
    ...base,
    slug,
    title: slug,
    summary: null,
    track: null,
    orderIndex,
    status,
    publishAt,
  }) as CatalogCourseRow;

const lesson = (n: number, status: string, orderIndex = 0) => ({
  ...base,
  id: id(n),
  title: `Aula ${n}`,
  kind: 'video' as const,
  durationMinutes: 10,
  isFree: false,
  orderIndex,
  status,
});

const modules: CatalogModuleRow[] = [
  {
    ...base,
    id: id(2),
    title: 'Rascunho',
    orderIndex: 0,
    status: 'draft',
    lessons: [lesson(20, 'published')],
  },
  {
    ...base,
    id: id(1),
    title: 'Módulo 1',
    orderIndex: 1,
    status: 'published',
    lessons: [
      lesson(12, 'published', 2),
      lesson(11, 'published', 1),
      { ...lesson(13, 'scheduled'), publishAt: soon },
    ],
  },
];

function reader(rows: CatalogCourseRow[]): CatalogReader {
  return {
    courses: async () => rows,
    course: async (slug) => {
      const row = rows.find((c) => c.slug === slug);
      return row ? { ...row, modules } : null;
    },
  };
}

const done = '2026-10-27T12:00:00.000Z';
const progress: ProgressStore = {
  forLessons: async (userId, ids) =>
    userId === 'membro-1' && ids.includes(id(11))
      ? [{ lessonId: id(11), positionSeconds: 0, completedAt: done, updatedAt: done }]
      : [],
  save: async () => {
    throw new Error('não usado');
  },
};
const deps = (rows: CatalogCourseRow[]) => ({ reader: reader(rows), progress });

describe('catálogo do membro', () => {
  it('lista disponíveis e programados na ordem da owner; rascunho fica de fora', async () => {
    const catalog = await listCatalog(
      reader([
        course('b', 2, 'published'),
        course('a', 1, 'scheduled', soon),
        course('c', 0, 'draft'),
      ]),
      now,
    );
    expect(catalog.courses).toEqual([
      { slug: 'a', title: 'a', summary: null, availability: 'scheduled', availableAt: soon },
      { slug: 'b', title: 'b', summary: null, availability: 'available', availableAt: null },
    ]);
  });

  it('página do curso: só módulos e aulas liberados, na ordem, sem conteúdo', async () => {
    const detail = await findCourse(
      deps([course('gestao', 0, 'published')]),
      'gestao',
      'outro',
      now,
    );
    expect(detail?.modules).toEqual([
      {
        id: id(1),
        title: 'Módulo 1',
        lessons: [
          {
            id: id(11),
            title: 'Aula 11',
            kind: 'video',
            durationMinutes: 10,
            isFree: false,
            completed: false,
          },
          {
            id: id(12),
            title: 'Aula 12',
            kind: 'video',
            durationMinutes: 10,
            isFree: false,
            completed: false,
          },
        ],
      },
    ]);
  });

  it('progresso de quem vê: aula concluída marcada e continua na próxima; outro membro não vê', async () => {
    const rows = [course('gestao', 0, 'published')];
    const mine = await findCourse(deps(rows), 'gestao', 'membro-1', now);
    expect(mine?.modules[0]?.lessons.map((l) => l.completed)).toEqual([true, false]);
    expect(mine?.resume).toEqual({ lessonId: id(12), title: 'Aula 12', state: 'continue' });
    const other = await findCourse(deps(rows), 'gestao', 'outro', now);
    expect(other?.modules[0]?.lessons.map((l) => l.completed)).toEqual([false, false]);
    expect(other?.resume).toEqual({ lessonId: id(11), title: 'Aula 11', state: 'start' });
  });

  it('curso programado mostra a data e nenhuma aula; rascunho e inexistente: null', async () => {
    const rows = [course('breve', 0, 'scheduled', soon), course('rascunho', 1, 'draft')];
    expect(await findCourse(deps(rows), 'breve', 'outro', now)).toMatchObject({
      availability: 'scheduled',
      availableAt: soon,
      modules: [],
    });
    expect(await findCourse(deps(rows), 'rascunho', 'outro', now)).toBeNull();
    expect(await findCourse(deps(rows), 'nao-existe', 'outro', now)).toBeNull();
  });
});
