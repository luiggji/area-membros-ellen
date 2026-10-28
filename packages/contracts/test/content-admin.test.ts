import { describe, expect, it } from 'vitest';

import {
  createCourseRequestSchema,
  createLessonRequestSchema,
  createTrackRequestSchema,
  lessonContentRequestSchema,
  updateCourseRequestSchema,
  updateLessonRequestSchema,
  updateModuleRequestSchema,
  updateTrackRequestSchema,
} from '../src/content-admin.js';

const base = { title: 'Gestão do escritório', summary: '', orderIndex: 0, trackId: null };

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

describe('editor de conteúdo: aulas e conteúdo (CF-172)', () => {
  const lesson = {
    title: 'Aula 1',
    summary: '',
    kind: 'video',
    durationMinutes: 12,
    isFree: false,
    orderIndex: 0,
    status: 'draft',
    publishAt: null,
  };

  it('aula: tipo vídeo ou texto, duração de 1 a 600 ou vazia, agendada exige data', () => {
    expect(updateLessonRequestSchema.safeParse(lesson).success).toBe(true);
    expect(updateLessonRequestSchema.safeParse({ ...lesson, durationMinutes: null }).success).toBe(
      true,
    );
    expect(updateLessonRequestSchema.safeParse({ ...lesson, durationMinutes: 0 }).success).toBe(
      false,
    );
    expect(updateLessonRequestSchema.safeParse({ ...lesson, kind: 'audio' }).success).toBe(false);
    expect(updateLessonRequestSchema.safeParse({ ...lesson, status: 'scheduled' }).success).toBe(
      false,
    );
    expect(createLessonRequestSchema.safeParse({ title: 'A', kind: 'video' }).success).toBe(false);
  });

  it('mídia é referência opaca do provedor, nunca link', () => {
    expect(
      lessonContentRequestSchema.parse({ bodyMd: ' # Texto ', mediaRef: ' abc-123_X.v2 ' }),
    ).toEqual({ bodyMd: '# Texto', mediaRef: 'abc-123_X.v2' });
    expect(lessonContentRequestSchema.safeParse({ bodyMd: '', mediaRef: '' }).success).toBe(true);
    expect(
      lessonContentRequestSchema.safeParse({ bodyMd: '', mediaRef: 'https://video.exemplo/abc' })
        .success,
    ).toBe(false);
    expect(
      lessonContentRequestSchema.safeParse({ bodyMd: 'x'.repeat(50_001), mediaRef: '' }).success,
    ).toBe(false);
  });
});

describe('editor de conteúdo: trilhas (CF-173)', () => {
  it('trilha: endereço normalizado; agendada exige data; curso aceita trilha ou avulso', () => {
    expect(
      createTrackRequestSchema.parse({ title: 'Comece aqui', slug: ' Comece-Aqui ', summary: '' }),
    ).toMatchObject({ slug: 'comece-aqui' });
    const track = {
      title: 'Comece aqui',
      summary: '',
      orderIndex: 0,
      status: 'scheduled',
      publishAt: null,
    };
    expect(updateTrackRequestSchema.safeParse(track).success).toBe(false);
    expect(
      updateCourseRequestSchema.safeParse({
        ...base,
        trackId: 'nao-e-uuid',
        status: 'draft',
        publishAt: null,
      }).success,
    ).toBe(false);
  });
});
