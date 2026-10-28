import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { LessonReader, LessonRecord, VideoProvider } from '../application/player';

const LESSON =
  'id, title, summary, kind, duration_minutes, is_free, status, publish_at, lesson_contents(body_md, media_ref), course_modules(title, status, publish_at, courses(slug, title, status, publish_at, tracks(status, publish_at)))';

/**
 * Aula com o caminho de publicação e o conteúdo protegido, lida com a chave de serviço. Quem
 * decide se o conteúdo sai é o caso de uso (`viewLesson`), com o acesso lido no banco.
 */
export class SupabaseLessonReader implements LessonReader {
  constructor(private readonly client: SupabaseAdmin) {}

  async lesson(id: string): Promise<LessonRecord | null> {
    const { data, error } = await this.client
      .from('lessons')
      .select(LESSON)
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`player: falha ao ler aula (${error.code})`);
    const module = data?.course_modules;
    const course = module?.courses;
    if (!data || !module || !course) return null;
    return {
      id: data.id,
      title: data.title,
      summary: data.summary,
      kind: data.kind as 'video' | 'text',
      durationMinutes: data.duration_minutes,
      isFree: data.is_free,
      status: data.status,
      publishAt: data.publish_at,
      bodyMd: data.lesson_contents?.body_md ?? null,
      mediaRef: data.lesson_contents?.media_ref ?? null,
      module: { title: module.title, status: module.status, publishAt: module.publish_at },
      course: {
        slug: course.slug,
        title: course.title,
        status: course.status,
        publishAt: course.publish_at,
      },
      track: course.tracks
        ? { status: course.tracks.status, publishAt: course.tracks.publish_at }
        : null,
    };
  }
}

/** Dev sem Supabase: nenhuma aula. */
export class UnconfiguredLessonReader implements LessonReader {
  async lesson(): Promise<null> {
    return null;
  }
}

/** Provedor de vídeo ainda não escolhido (P-007): a aula mostra "vídeo em preparação". */
export class UnconfiguredVideoProvider implements VideoProvider {
  readonly configured = false;

  async playbackUrl(): Promise<string> {
    throw new Error('Provedor de vídeo não configurado (P-007)');
  }
}
