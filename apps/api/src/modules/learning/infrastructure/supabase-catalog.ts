import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { CatalogCourseRow, CatalogModuleRow, CatalogReader } from '../application/catalog';

const COURSE =
  'slug, title, summary, order_index, status, publish_at, created_at, tracks(status, publish_at)';
const TREE =
  'course_modules(id, title, order_index, status, publish_at, created_at, lessons(id, title, kind, duration_minutes, is_free, order_index, status, publish_at, created_at))';

type CourseRecord = {
  slug: string;
  title: string;
  summary: string | null;
  order_index: number;
  status: string;
  publish_at: string | null;
  created_at: string;
  tracks: { status: string; publish_at: string | null } | null;
};

const ordered = (row: {
  order_index: number;
  status: string;
  publish_at: string | null;
  created_at: string;
}) => ({
  orderIndex: row.order_index,
  status: row.status,
  publishAt: row.publish_at,
  createdAt: row.created_at,
});

const toCourse = (row: CourseRecord): CatalogCourseRow => ({
  slug: row.slug,
  title: row.title,
  summary: row.summary,
  track: row.tracks ? { status: row.tracks.status, publishAt: row.tracks.publish_at } : null,
  ...ordered(row),
});

/**
 * Leitura do catálogo com a chave de serviço: precisa enxergar cursos programados (que o RLS
 * esconde do membro) para mostrar a data. Só lê a estrutura; `lesson_contents` nunca é lido aqui.
 */
export class SupabaseCatalogReader implements CatalogReader {
  constructor(private readonly client: SupabaseAdmin) {}

  async courses(): Promise<CatalogCourseRow[]> {
    const { data, error } = await this.client
      .from('courses')
      .select(COURSE)
      .in('status', ['published', 'scheduled']);
    if (error) throw new Error(`catálogo: falha ao listar (${error.code})`);
    return data.map(toCourse);
  }

  async course(slug: string): Promise<(CatalogCourseRow & { modules: CatalogModuleRow[] }) | null> {
    const { data, error } = await this.client
      .from('courses')
      .select(`${COURSE}, ${TREE}`)
      .eq('slug', slug)
      .in('status', ['published', 'scheduled'])
      .maybeSingle();
    if (error) throw new Error(`catálogo: falha ao ler curso (${error.code})`);
    if (!data) return null;
    return {
      ...toCourse(data),
      modules: data.course_modules.map((module) => ({
        id: module.id,
        title: module.title,
        ...ordered(module),
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          kind: lesson.kind as 'video' | 'text',
          durationMinutes: lesson.duration_minutes,
          isFree: lesson.is_free,
          ...ordered(lesson),
        })),
      })),
    };
  }
}

/** Dev sem Supabase: catálogo vazio verdadeiro. */
export class UnconfiguredCatalogReader implements CatalogReader {
  async courses(): Promise<CatalogCourseRow[]> {
    return [];
  }

  async course(): Promise<null> {
    return null;
  }
}
