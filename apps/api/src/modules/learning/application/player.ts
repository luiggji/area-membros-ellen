import { LessonView } from '@caixa-forte/contracts';

import { AccessReader } from '../../membership/application/ports';
import { isReleased, Publication } from '../domain/publication';

/** Aula com o caminho de publicação (módulo, curso, trilha) e o conteúdo protegido. */
export interface LessonRecord extends Publication {
  id: string;
  title: string;
  summary: string | null;
  kind: 'video' | 'text';
  durationMinutes: number | null;
  isFree: boolean;
  bodyMd: string | null;
  mediaRef: string | null;
  module: Publication & { title: string };
  course: Publication & { slug: string; title: string };
  track: Publication | null;
}

export interface LessonReader {
  lesson(id: string): Promise<LessonRecord | null>;
}
export const LESSON_READER = Symbol('LESSON_READER');

/**
 * Provedor de vídeo (P-007). O adaptador real devolve uma URL assinada e temporária do provedor;
 * sem provedor configurado, a aula mostra "vídeo em preparação" e nenhum token é emitido.
 */
export interface VideoProvider {
  readonly configured: boolean;
  playbackUrl(mediaRef: string): Promise<string>;
}
export const VIDEO_PROVIDER = Symbol('VIDEO_PROVIDER');

export interface MediaClaims {
  mediaRef: string;
  viewerId: string;
}

/** Tokens de mídia assinados no servidor, com validade; nunca uma URL pública permanente. */
export interface MediaTokens {
  issue(claims: MediaClaims, expiresAt: Date): string;
  verify(token: string, now: Date): MediaClaims | 'expired' | 'invalid';
}
export const MEDIA_TOKENS = Symbol('MEDIA_TOKENS');

/** Validade do link do vídeo: a duração da aula com folga (mín. 30 min, máx. 4 h). */
export function videoTtlMinutes(durationMinutes: number | null): number {
  return Math.min(240, Math.max(30, (durationMinutes ?? 0) + 30));
}

export interface PlayerDeps {
  lessons: LessonReader;
  access: AccessReader;
  video: VideoProvider;
  tokens: MediaTokens;
}

/**
 * Aula no player (CF-083). Fora do ar (rascunho, agendada antes da data, curso/módulo/trilha não
 * liberados) → `null` (404). Liberada só com acesso pago vigente ou aula aberta: sem isso, saem
 * apenas os dados públicos da aula, sem texto e sem vídeo.
 */
export async function viewLesson(
  deps: PlayerDeps,
  lessonId: string,
  viewerId: string,
  now: Date,
): Promise<LessonView | null> {
  const lesson = await deps.lessons.lesson(lessonId);
  if (!lesson) return null;
  const path = [lesson, lesson.module, lesson.course, ...(lesson.track ? [lesson.track] : [])];
  if (!path.every((item) => isReleased(item, now))) return null;

  const granted = lesson.isFree || (await deps.access.accessOf(viewerId, 'caixa_forte')) !== null;
  const base = {
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    kind: lesson.kind,
    durationMinutes: lesson.durationMinutes,
    isFree: lesson.isFree,
    course: { slug: lesson.course.slug, title: lesson.course.title },
    moduleTitle: lesson.module.title,
  };
  if (!granted) {
    return { ...base, access: 'subscription_required', bodyMd: null, video: null };
  }

  let video: LessonView['video'] = null;
  if (lesson.mediaRef && !deps.video.configured) video = { state: 'pending' };
  if (lesson.mediaRef && deps.video.configured) {
    const expiresAt = new Date(now.getTime() + videoTtlMinutes(lesson.durationMinutes) * 60_000);
    const token = deps.tokens.issue({ mediaRef: lesson.mediaRef, viewerId }, expiresAt);
    video = { state: 'ready', path: `/midia/${token}`, expiresAt: expiresAt.toISOString() };
  }
  return { ...base, access: 'granted', bodyMd: lesson.bodyMd, video };
}
