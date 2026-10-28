import { describe, expect, it } from '@jest/globals';

import { applyProgress, ProgressRow, resumeOf } from './progress';

const now = new Date('2026-10-28T12:00:00.000Z');
const earlier = '2026-10-20T12:00:00.000Z';

describe('aplicar progresso', () => {
  it('posição muda só quando vem; primeira gravação começa do zero', () => {
    expect(applyProgress(null, { positionSeconds: 95 }, now)).toEqual({
      positionSeconds: 95,
      completedAt: null,
    });
    expect(
      applyProgress({ positionSeconds: 95, completedAt: null }, { completed: true }, now),
    ).toEqual({
      positionSeconds: 95,
      completedAt: now.toISOString(),
    });
  });

  it('concluir de novo mantém a primeira data; desmarcar limpa', () => {
    const done = { positionSeconds: 0, completedAt: earlier };
    expect(applyProgress(done, { completed: true }, now).completedAt).toBe(earlier);
    expect(applyProgress(done, { positionSeconds: 10 }, now).completedAt).toBe(earlier);
    expect(applyProgress(done, { completed: false }, now).completedAt).toBeNull();
  });
});

describe('por onde seguir no curso', () => {
  const lessons = [
    { id: 'a', title: 'A' },
    { id: 'b', title: 'B' },
    { id: 'c', title: 'C' },
  ];
  const row = (
    lessonId: string,
    updatedAt: string,
    completedAt: string | null = null,
  ): ProgressRow => ({
    lessonId,
    positionSeconds: 0,
    completedAt,
    updatedAt,
  });

  it('nada começado: a primeira aula, para começar; curso sem aulas: nada', () => {
    expect(resumeOf(lessons, [])).toEqual({ lessonId: 'a', title: 'A', state: 'start' });
    expect(resumeOf([], [])).toBeNull();
  });

  it('continua a aula mexida mais recentemente que não foi concluída', () => {
    const rows = [row('a', '2026-10-27T10:00:00Z'), row('c', '2026-10-28T10:00:00Z')];
    expect(resumeOf(lessons, rows)).toEqual({ lessonId: 'c', title: 'C', state: 'continue' });
  });

  it('só concluídas mexidas: a primeira não concluída; tudo concluído: nada', () => {
    expect(resumeOf(lessons, [row('a', earlier, earlier)])).toEqual({
      lessonId: 'b',
      title: 'B',
      state: 'continue',
    });
    expect(
      resumeOf(lessons, [
        row('a', earlier, earlier),
        row('b', earlier, earlier),
        row('c', earlier, earlier),
      ]),
    ).toBeNull();
  });

  it('progresso de aula que saiu do ar não conta', () => {
    expect(resumeOf(lessons, [row('fora-do-ar', earlier)])).toEqual({
      lessonId: 'a',
      title: 'A',
      state: 'start',
    });
  });
});
