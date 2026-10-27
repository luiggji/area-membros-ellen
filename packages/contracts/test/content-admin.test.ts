import { describe, expect, it } from 'vitest';

import {
  createCourseRequestSchema,
  updateCourseRequestSchema,
  updateModuleRequestSchema,
} from '../src/content-admin.js';

const base = { title: 'Gestão do escritório', summary: '', orderIndex: 0 };

describe('editor de conteúdo: cursos e módulos (CF-081)', () => {
  it('endereço do curso em kebab-case, normalizado', () => {
    expect(
      createCourseRequestSchema.parse({
        title: 'Gestão',
        slug: ' Gestao-Do-Escritorio ',
        summary: '',
      }),
    ).toMatchObject({ slug: 'gestao-do-escritorio' });
    expect(
      createCourseRequestSchema.safeParse({
        title: 'Gestão',
        slug: 'gestão escritório',
        summary: '',
      }).success,
    ).toBe(false);
  });

  it('agendado exige data com fuso; rascunho e publicado aceitam sem data', () => {
    expect(
      updateCourseRequestSchema.safeParse({ ...base, status: 'scheduled', publishAt: null })
        .success,
    ).toBe(false);
    expect(
      updateCourseRequestSchema.safeParse({
        ...base,
        status: 'scheduled',
        publishAt: '2026-11-03T12:00:00.000Z',
      }).success,
    ).toBe(true);
    expect(
      updateCourseRequestSchema.safeParse({ ...base, status: 'draft', publishAt: null }).success,
    ).toBe(true);
    expect(
      updateModuleRequestSchema.safeParse({
        title: 'Módulo 1',
        orderIndex: 0,
        status: 'scheduled',
        publishAt: '2026-11-03 12:00',
      }).success,
    ).toBe(false);
  });

  it('ordem inteira a partir de 0', () => {
    expect(
      updateCourseRequestSchema.safeParse({
        ...base,
        orderIndex: -1,
        status: 'draft',
        publishAt: null,
      }).success,
    ).toBe(false);
  });
});
