import { describe, expect, it } from '@jest/globals';

import { MemberAccess } from '../../membership/application/ports';
import { LessonRecord, PlayerDeps, videoTtlMinutes, viewLesson } from './player';

const now = new Date('2026-10-28T12:00:00.000Z');
const LESSON = '3c4d5e6f-7a8b-4c9d-8e1f-2a3b4c5d6e7f';
const published = { status: 'published', publishAt: null };

const record = (over: Partial<LessonRecord> = {}): LessonRecord => ({
  ...published,
  id: LESSON,
  title: 'Aula 1',
  summary: null,
  kind: 'video',
  durationMinutes: 12,
  isFree: false,
  bodyMd: '# Texto protegido',
  mediaRef: 'video-1',
  module: { ...published, title: 'Módulo 1' },
  course: { ...published, slug: 'gestao', title: 'Gestão' },
  track: null,
  ...over,
});

const ACCESS: MemberAccess = { source: 'manual', subscriptionStatus: null, validUntil: null };

function deps(lesson: LessonRecord | null, access: MemberAccess | null, configured = true) {
  const issued: unknown[] = [];
  const value: PlayerDeps = {
    lessons: { lesson: async () => lesson },
    access: { accessOf: async () => access },
    video: { configured, playbackUrl: async () => 'https://provedor.test/x' },
    tokens: {
      issue: (claims, expiresAt) => {
        issued.push([claims, expiresAt.toISOString()]);
        return 'tok';
      },
      verify: () => 'invalid',
    },
  };
  return { value, issued };
}

describe('aula no player (paywall no servidor)', () => {
  it('com acesso: texto e link de vídeo assinado com validade', async () => {
    const { value, issued } = deps(record(), ACCESS);
    const view = await viewLesson(value, LESSON, 'membro-1', now);
    expect(view).toMatchObject({
      access: 'granted',
      bodyMd: '# Texto protegido',
      video: { state: 'ready', path: '/midia/tok', expiresAt: '2026-10-28T12:42:00.000Z' },
    });
    expect(issued).toEqual([
      [{ mediaRef: 'video-1', viewerId: 'membro-1' }, '2026-10-28T12:42:00.000Z'],
    ]);
  });

  it('sem acesso: só dados públicos, nenhum token emitido', async () => {
    const { value, issued } = deps(record(), null);
    expect(await viewLesson(value, LESSON, 'membro-1', now)).toMatchObject({
      access: 'subscription_required',
      bodyMd: null,
      video: null,
    });
    expect(issued).toEqual([]);
  });

  it('aula aberta libera mesmo sem assinatura', async () => {
    const { value } = deps(record({ isFree: true }), null);
    expect(await viewLesson(value, LESSON, 'membro-1', now)).toMatchObject({ access: 'granted' });
  });

  it('provedor não configurado: vídeo pendente, sem token; aula sem vídeo: null', async () => {
    const pending = deps(record(), ACCESS, false);
    expect((await viewLesson(pending.value, LESSON, 'm', now))?.video).toEqual({
      state: 'pending',
    });
    expect(pending.issued).toEqual([]);
    const text = deps(record({ mediaRef: null, kind: 'text' }), ACCESS);
    expect((await viewLesson(text.value, LESSON, 'm', now))?.video).toBeNull();
  });

  it('fora do ar no caminho (aula, módulo, curso ou trilha): null', async () => {
    const soon = { status: 'scheduled', publishAt: '2026-11-03T12:00:00.000Z' };
    for (const over of [
      { ...soon },
      { module: { ...soon, title: 'M' } },
      { course: { status: 'draft', publishAt: null, slug: 'g', title: 'G' } },
      { track: { status: 'draft', publishAt: null } },
    ]) {
      const { value } = deps(record(over as Partial<LessonRecord>), ACCESS);
      expect(await viewLesson(value, LESSON, 'm', now)).toBeNull();
    }
    expect(await viewLesson(deps(null, ACCESS).value, LESSON, 'm', now)).toBeNull();
  });

  it('validade do link: duração com folga, entre 30 min e 4 h', () => {
    expect(videoTtlMinutes(null)).toBe(30);
    expect(videoTtlMinutes(12)).toBe(42);
    expect(videoTtlMinutes(600)).toBe(240);
  });
});
