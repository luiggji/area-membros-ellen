import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { ProgressStore } from '../application/progress';
import { applyProgress, ProgressChange, ProgressRow } from '../domain/progress';

type Record = {
  lesson_id: string;
  last_position_seconds: number;
  completed_at: string | null;
  updated_at: string;
};

const COLUMNS = 'lesson_id, last_position_seconds, completed_at, updated_at';

const toRow = (record: Record): ProgressRow => ({
  lessonId: record.lesson_id,
  positionSeconds: record.last_position_seconds,
  completedAt: record.completed_at,
  updatedAt: record.updated_at,
});

/** Progresso com a chave de serviço, sempre filtrado pela pessoa que a API autenticou. */
export class SupabaseProgressStore implements ProgressStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async forLessons(userId: string, lessonIds: string[]): Promise<ProgressRow[]> {
    const { data, error } = await this.client
      .from('lesson_progress')
      .select(COLUMNS)
      .eq('user_id', userId)
      .in('lesson_id', lessonIds);
    if (error) throw new Error(`progresso: falha ao ler (${error.code})`);
    return data.map(toRow);
  }

  async save(
    userId: string,
    lessonId: string,
    change: ProgressChange,
    now: Date,
  ): Promise<ProgressRow> {
    const [current] = await this.forLessons(userId, [lessonId]);
    const next = applyProgress(current ?? null, change, now);
    const { data, error } = await this.client
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          last_position_seconds: next.positionSeconds,
          completed_at: next.completedAt,
        },
        { onConflict: 'user_id,lesson_id' },
      )
      .select(COLUMNS)
      .single();
    if (error) throw new Error(`progresso: falha ao gravar (${error.code})`);
    return toRow(data);
  }
}

/** Dev sem Supabase: nenhum progresso; gravar falha alto em vez de fingir. */
export class UnconfiguredProgressStore implements ProgressStore {
  async forLessons(): Promise<ProgressRow[]> {
    return [];
  }

  async save(): Promise<ProgressRow> {
    throw new Error('Supabase não configurado: progresso indisponível');
  }
}
