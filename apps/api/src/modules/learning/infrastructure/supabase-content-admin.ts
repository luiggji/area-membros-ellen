import {
  AdminContent,
  ContentStatus,
  CreateCourseRequest,
  CreateLessonRequest,
  CreateModuleRequest,
  LessonContentRequest,
  LessonKind,
  UpdateCourseRequest,
  UpdateLessonRequest,
  UpdateModuleRequest,
} from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { ContentAdminStore, ContentWrite } from '../application/content-admin';

type DbError = { code?: string } | null;

/** Erros do banco que viram resposta de negócio; o resto falha alto (500). */
function toWrite(rows: { id: string }[] | null, error: DbError, what: string): ContentWrite {
  if (error?.code === '23505') return { status: 'duplicate' };
  if (error?.code === '23503') return { status: 'not_found' };
  if (error) throw new Error(`${what}: falha (${error.code})`);
  const id = rows?.[0]?.id;
  return id ? { status: 'ok', id } : { status: 'not_found' };
}

const byOrder = <T extends { order_index: number; created_at: string }>(a: T, b: T) =>
  a.order_index - b.order_index || a.created_at.localeCompare(b.created_at);

export class SupabaseContentAdminStore implements ContentAdminStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async tree(): Promise<AdminContent> {
    const { data, error } = await this.client
      .from('courses')
      .select(
        'id, slug, title, summary, track_id, order_index, status, publish_at, created_at, course_modules(id, title, order_index, status, publish_at, created_at, lessons(id, title, summary, kind, duration_minutes, is_free, order_index, status, publish_at, created_at, lesson_contents(body_md, media_ref)))',
      );
    if (error) throw new Error(`courses: falha ao listar (${error.code})`);
    return {
      courses: [...data].sort(byOrder).map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        trackId: course.track_id,
        orderIndex: course.order_index,
        status: course.status as ContentStatus,
        publishAt: course.publish_at,
        modules: [...course.course_modules].sort(byOrder).map((module) => ({
          id: module.id,
          title: module.title,
          orderIndex: module.order_index,
          status: module.status as ContentStatus,
          publishAt: module.publish_at,
          lessons: [...module.lessons].sort(byOrder).map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            kind: lesson.kind as LessonKind,
            durationMinutes: lesson.duration_minutes,
            isFree: lesson.is_free,
            orderIndex: lesson.order_index,
            status: lesson.status as ContentStatus,
            publishAt: lesson.publish_at,
            bodyMd: lesson.lesson_contents?.body_md ?? null,
            mediaRef: lesson.lesson_contents?.media_ref ?? null,
          })),
        })),
      })),
    };
  }

  async createCourse(input: CreateCourseRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('courses')
      .insert({ slug: input.slug, title: input.title, summary: input.summary || null })
      .select('id');
    return toWrite(data, error, 'courses.insert');
  }

  async updateCourse(id: string, input: UpdateCourseRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('courses')
      .update({
        title: input.title,
        summary: input.summary || null,
        order_index: input.orderIndex,
        status: input.status,
        publish_at: input.publishAt,
      })
      .eq('id', id)
      .select('id');
    return toWrite(data, error, 'courses.update');
  }

  async createModule(courseId: string, input: CreateModuleRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('course_modules')
      .insert({ course_id: courseId, title: input.title })
      .select('id');
    return toWrite(data, error, 'course_modules.insert');
  }

  async updateModule(id: string, input: UpdateModuleRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('course_modules')
      .update({
        title: input.title,
        order_index: input.orderIndex,
        status: input.status,
        publish_at: input.publishAt,
      })
      .eq('id', id)
      .select('id');
    return toWrite(data, error, 'course_modules.update');
  }

  async createLesson(moduleId: string, input: CreateLessonRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('lessons')
      .insert({ module_id: moduleId, title: input.title, kind: input.kind })
      .select('id');
    return toWrite(data, error, 'lessons.insert');
  }

  async updateLesson(id: string, input: UpdateLessonRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('lessons')
      .update({
        title: input.title,
        summary: input.summary || null,
        kind: input.kind,
        duration_minutes: input.durationMinutes,
        is_free: input.isFree,
        order_index: input.orderIndex,
        status: input.status,
        publish_at: input.publishAt,
      })
      .eq('id', id)
      .select('id');
    return toWrite(data, error, 'lessons.update');
  }

  /** Uma linha por aula (a chave é a própria aula): grava ou substitui o conteúdo inteiro. */
  async saveLessonContent(lessonId: string, input: LessonContentRequest): Promise<ContentWrite> {
    const { data, error } = await this.client
      .from('lesson_contents')
      .upsert(
        { lesson_id: lessonId, body_md: input.bodyMd || null, media_ref: input.mediaRef || null },
        { onConflict: 'lesson_id' },
      )
      .select('id:lesson_id');
    return toWrite(data, error, 'lesson_contents.upsert');
  }
}

/** Dev sem Supabase: nada para listar; escrever falha alto em vez de fingir sucesso. */
export class UnconfiguredContentAdminStore implements ContentAdminStore {
  async tree(): Promise<AdminContent> {
    return { courses: [] };
  }

  private fail(): never {
    throw new Error('Supabase não configurado: editor de conteúdo indisponível');
  }

  async createCourse(): Promise<ContentWrite> {
    this.fail();
  }

  async updateCourse(): Promise<ContentWrite> {
    this.fail();
  }

  async createModule(): Promise<ContentWrite> {
    this.fail();
  }

  async updateModule(): Promise<ContentWrite> {
    this.fail();
  }

  async createLesson(): Promise<ContentWrite> {
    this.fail();
  }

  async updateLesson(): Promise<ContentWrite> {
    this.fail();
  }

  async saveLessonContent(): Promise<ContentWrite> {
    this.fail();
  }
}
