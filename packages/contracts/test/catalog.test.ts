import { describe, expect, it } from 'vitest';

import { catalogCourseSchema } from '../src/catalog.js';

describe('catálogo do membro', () => {
  it('só disponível ou programado; rascunho não é um estado do catálogo', () => {
    const course = {
      slug: 'gestao',
      title: 'Gestão',
      summary: null,
      availability: 'scheduled',
      availableAt: '2026-11-03T12:00:00.000Z',
    };
    expect(catalogCourseSchema.safeParse(course).success).toBe(true);
    expect(catalogCourseSchema.safeParse({ ...course, availability: 'draft' }).success).toBe(false);
  });
});
