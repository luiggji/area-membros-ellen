import type { CatalogCourse } from '@caixa-forte/contracts';
import { describe, expect, it } from 'vitest';

import {
  availabilityText,
  emptyCatalogText,
  filterCatalog,
  parseCatalogFilter,
} from './catalog-view';

const course = (slug: string, availability: 'available' | 'scheduled'): CatalogCourse => ({
  slug,
  title: slug,
  summary: null,
  availability,
  availableAt: availability === 'scheduled' ? '2026-11-03T12:00:00.000Z' : null,
});
const courses = [course('a', 'available'), course('b', 'scheduled')];

describe('catálogo: filtros e rótulos', () => {
  it('filtro da URL; valor desconhecido ou ausente vira "todos"', () => {
    expect(parseCatalogFilter('programados')).toBe('programados');
    expect(parseCatalogFilter('qualquer')).toBe('todos');
    expect(parseCatalogFilter(undefined)).toBe('todos');
    expect(parseCatalogFilter(['disponiveis'])).toBe('todos');
  });

  it('separa disponíveis e programados', () => {
    expect(filterCatalog(courses, 'todos')).toHaveLength(2);
    expect(filterCatalog(courses, 'disponiveis').map((c) => c.slug)).toEqual(['a']);
    expect(filterCatalog(courses, 'programados').map((c) => c.slug)).toEqual(['b']);
  });

  it('programado mostra a data no horário de Brasília; disponível não leva rótulo', () => {
    expect(availabilityText(courses[1]!)).toBe('Programado para 03/11/2026');
    expect(
      availabilityText({ availability: 'scheduled', availableAt: '2026-11-03T02:00:00.000Z' }),
    ).toBe('Programado para 02/11/2026');
    expect(availabilityText(courses[0]!)).toBeUndefined();
  });

  it('grade vazia diz a verdade conforme o filtro, sem prometer data', () => {
    expect(emptyCatalogText('todos')).toContain('Ainda não há cursos publicados');
    expect(emptyCatalogText('programados')).toBe('Nenhum curso programado no momento.');
  });
});
