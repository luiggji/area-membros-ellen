import { describe, expect, it } from 'vitest';

import {
  catalogCourses,
  filterCourses,
  findLesson,
  parseCatalogFilter,
  parseJourneyStep,
} from './learning-fixtures';

describe('demonstração — aprendizado', () => {
  it('curso programado não tem aulas (sem capa chamando aula inexistente)', () => {
    for (const course of catalogCourses.filter((item) => item.status === 'programado')) {
      expect(course.modules).toHaveLength(0);
      expect(course.scheduledFor).toBeTruthy();
    }
  });

  it('filtros do catálogo separam disponíveis e programados', () => {
    expect(filterCourses('disponiveis').every((c) => c.status === 'disponivel')).toBe(true);
    expect(filterCourses('programados').every((c) => c.status === 'programado')).toBe(true);
    expect(filterCourses(parseCatalogFilter('qualquer'))).toHaveLength(catalogCourses.length);
  });

  it('aula conhece a anterior e a próxima do mesmo curso', () => {
    const found = findLesson('cc-2');
    expect(found?.course.slug).toBe('comece-aqui');
    expect(found?.previous?.id).toBe('cc-1');
    expect(found?.next?.id).toBe('cc-3');
    expect(findLesson('nao-existe')).toBeUndefined();
  });

  it('etapa desconhecida da jornada cai no diagnóstico', () => {
    expect(parseJourneyStep('acoes')).toBe('acoes');
    expect(parseJourneyStep(['acoes'])).toBe('diagnostico');
  });
});
