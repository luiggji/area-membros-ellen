import type { CourseDetail } from '@caixa-forte/contracts';
import { describe, expect, it } from 'vitest';

import { courseProgressText, nextLesson } from './course-progress';

const lesson = (id: string, completed = false) => ({
  id,
  title: `Aula ${id}`,
  kind: 'video' as const,
  durationMinutes: null,
  isFree: false,
  completed,
});
const modules = (...groups: ReturnType<typeof lesson>[][]): CourseDetail['modules'] =>
  groups.map((lessons, i) => ({ id: `m${i}`, title: `Módulo ${i}`, lessons }));

describe('progresso do curso na tela', () => {
  it('só mostra número quando há aula concluída de verdade', () => {
    expect(courseProgressText(modules([lesson('a'), lesson('b')]))).toBeNull();
    expect(courseProgressText(modules([lesson('a', true), lesson('b')], [lesson('c')]))).toBe(
      '1 de 3 aulas concluídas',
    );
    expect(courseProgressText(modules([lesson('a', true)]))).toBe('Todas as aulas concluídas');
    expect(courseProgressText([])).toBeNull();
  });

  it('próxima aula atravessa módulos; última ou aula desconhecida: nenhuma', () => {
    const course = modules([lesson('a'), lesson('b')], [lesson('c')]);
    expect(nextLesson(course, 'b')?.id).toBe('c');
    expect(nextLesson(course, 'c')).toBeNull();
    expect(nextLesson(course, 'x')).toBeNull();
  });
});
