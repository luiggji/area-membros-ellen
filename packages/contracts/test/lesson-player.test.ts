import { describe, expect, it } from 'vitest';

import { lessonViewSchema } from '../src/lesson-player.js';

const lesson = {
  id: '3c4d5e6f-7a8b-4c9d-8e1f-2a3b4c5d6e7f',
  title: 'Aula 1',
  summary: null,
  kind: 'video',
  durationMinutes: 12,
  isFree: false,
  course: { slug: 'gestao', title: 'Gestão' },
  moduleTitle: 'Módulo 1',
  access: 'subscription_required',
  bodyMd: null,
  video: null,
};

describe('aula no player', () => {
  it('vídeo pronto traz caminho e validade; pendente não traz nada', () => {
    const ready = { state: 'ready', path: '/midia/abc.def', expiresAt: '2026-10-28T13:00:00.000Z' };
    expect(lessonViewSchema.safeParse({ ...lesson, access: 'granted', video: ready }).success).toBe(
      true,
    );
    expect(lessonViewSchema.safeParse({ ...lesson, video: { state: 'pending' } }).success).toBe(
      true,
    );
    expect(lessonViewSchema.safeParse({ ...lesson, video: { state: 'ready' } }).success).toBe(
      false,
    );
  });
});
