import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { catalogState } from '../../learning/domain/publication';
import { MaterialRow, MaterialStore, NewMaterial } from '../application/materials';

const COLUMNS =
  'id, title, description, subject, version, license, revised_on, storage_key, file_name, mime_type, size_bytes, status, published_at, courses(slug, title, status, publish_at, tracks(status, publish_at))';

type Record = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  version: string;
  license: string | null;
  revised_on: string | null;
  storage_key: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  status: string;
  published_at: string | null;
  courses: {
    slug: string;
    title: string;
    status: string;
    publish_at: string | null;
    tracks: { status: string; publish_at: string | null } | null;
  } | null;
};

/**
 * Curso associado só aparece se estiver no catálogo (disponível ou programado): material publicado
 * não revela título de curso em rascunho.
 */
function visibleCourse(course: Record['courses'], now: Date) {
  if (!course) return null;
  const track = course.tracks
    ? { status: course.tracks.status, publishAt: course.tracks.publish_at }
    : null;
  return catalogState({ status: course.status, publishAt: course.publish_at }, track, now)
    ? { slug: course.slug, title: course.title }
    : null;
}

const toRow = (record: Record, now: Date): MaterialRow => ({
  id: record.id,
  title: record.title,
  description: record.description,
  subject: record.subject,
  version: record.version,
  license: record.license,
  revisedOn: record.revised_on,
  course: visibleCourse(record.courses, now),
  storageKey: record.storage_key,
  fileName: record.file_name,
  mimeType: record.mime_type,
  sizeBytes: record.size_bytes,
  status: record.status as MaterialRow['status'],
  publishedAt: record.published_at,
});

/** Tabela `materials` com a chave de serviço; excluídos (`deleted_at`) ficam fora de tudo. */
export class SupabaseMaterialStore implements MaterialStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async list(scope: 'published' | 'all'): Promise<MaterialRow[]> {
    let query = this.client.from('materials').select(COLUMNS).is('deleted_at', null);
    if (scope === 'published') query = query.eq('status', 'published');
    const { data, error } = await query.order('subject').order('title');
    if (error) throw new Error(`materiais: falha ao listar (${error.code})`);
    const now = new Date();
    return data.map((record) => toRow(record, now));
  }

  async create(material: NewMaterial): Promise<{ id: string } | 'course_not_found'> {
    const { data, error } = await this.client
      .from('materials')
      .insert({
        title: material.title,
        description: material.description,
        subject: material.subject,
        version: material.version,
        license: material.license,
        revised_on: material.revisedOn,
        course_id: material.courseId,
        storage_key: material.storageKey,
        file_name: material.fileName,
        mime_type: material.mimeType,
        size_bytes: material.sizeBytes,
      })
      .select('id')
      .single();
    if (error?.code === '23503') return 'course_not_found';
    if (error) throw new Error(`materiais: falha ao criar (${error.code})`);
    return { id: data.id };
  }

  async setStatus(id: string, status: 'draft' | 'published', now: Date): Promise<boolean> {
    const { data: current, error: readError } = await this.client
      .from('materials')
      .select('published_at')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (readError) throw new Error(`materiais: falha ao ler (${readError.code})`);
    if (!current) return false;
    const { error } = await this.client
      .from('materials')
      .update({
        status,
        published_at: current.published_at ?? (status === 'published' ? now.toISOString() : null),
      })
      .eq('id', id);
    if (error) throw new Error(`materiais: falha ao mudar o estado (${error.code})`);
    return true;
  }

  async softDelete(id: string, now: Date): Promise<{ storageKey: string; title: string } | null> {
    const { data, error } = await this.client
      .from('materials')
      .update({ deleted_at: now.toISOString(), status: 'draft' })
      .eq('id', id)
      .is('deleted_at', null)
      .select('storage_key, title')
      .maybeSingle();
    if (error) throw new Error(`materiais: falha ao excluir (${error.code})`);
    return data ? { storageKey: data.storage_key, title: data.title } : null;
  }
}

/** Dev sem Supabase: Cofre vazio; gravar falha alto. */
export class UnconfiguredMaterialStore implements MaterialStore {
  async list(): Promise<MaterialRow[]> {
    return [];
  }

  private fail(): never {
    throw new Error('Supabase não configurado: Cofre indisponível');
  }

  async create(): Promise<'course_not_found'> {
    this.fail();
  }

  async setStatus(): Promise<boolean> {
    this.fail();
  }

  async softDelete(): Promise<null> {
    this.fail();
  }
}
