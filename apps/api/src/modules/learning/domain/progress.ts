/** Progresso de uma pessoa numa aula (CF-084). */
export interface ProgressRow {
  lessonId: string;
  positionSeconds: number;
  completedAt: string | null;
  updatedAt: string;
}

export interface ProgressChange {
  positionSeconds?: number;
  completed?: boolean;
}

/**
 * Aplica uma mudança: a posição só muda quando vem; concluir mantém a data da primeira conclusão
 * (rever a aula não "conclui de novo"); desmarcar limpa a data.
 */
export function applyProgress(
  current: Pick<ProgressRow, 'positionSeconds' | 'completedAt'> | null,
  change: ProgressChange,
  now: Date,
): { positionSeconds: number; completedAt: string | null } {
  const completedAt =
    change.completed === undefined
      ? (current?.completedAt ?? null)
      : change.completed
        ? (current?.completedAt ?? now.toISOString())
        : null;
  return { positionSeconds: change.positionSeconds ?? current?.positionSeconds ?? 0, completedAt };
}

export type Resume = { lessonId: string; title: string; state: 'start' | 'continue' } | null;

/**
 * Por onde seguir, nas aulas liberadas do curso (na ordem): nada começado → a primeira ("começar");
 * senão a aula mexida mais recentemente que ainda não foi concluída; senão a primeira não
 * concluída; tudo concluído → `null`.
 */
export function resumeOf(lessons: { id: string; title: string }[], rows: ProgressRow[]): Resume {
  const first = lessons[0];
  if (!first) return null;
  const byLesson = new Map(rows.map((row) => [row.lessonId, row]));
  if (!lessons.some((lesson) => byLesson.has(lesson.id))) {
    return { lessonId: first.id, title: first.title, state: 'start' };
  }
  const open = lessons.filter((lesson) => !byLesson.get(lesson.id)?.completedAt);
  const recent = open
    .filter((lesson) => byLesson.has(lesson.id))
    .sort((a, b) => byLesson.get(b.id)!.updatedAt.localeCompare(byLesson.get(a.id)!.updatedAt))[0];
  const next = recent ?? open[0];
  return next ? { lessonId: next.id, title: next.title, state: 'continue' } : null;
}
