'use server';

import { saveProgressRequestSchema } from '@caixa-forte/contracts';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { saveLessonProgress } from '../infrastructure/progress-api';

export type CompleteState = { status: 'idle' } | { status: 'error'; message: string };

const lessonId = z.uuid();
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** Marca ou desmarca a aula como concluída; a API decide se a pessoa pode (CF-084). */
export async function setCompletedAction(
  _state: CompleteState,
  form: FormData,
): Promise<CompleteState> {
  const id = lessonId.safeParse(form.get('lessonId'));
  const course = slug.safeParse(form.get('courseSlug'));
  if (!id.success || !course.success) {
    return { status: 'error', message: 'Não foi possível salvar agora. Recarregue a página.' };
  }
  const ok = await saveLessonProgress(id.data, { completed: form.get('completed') === 'true' });
  if (!ok) return { status: 'error', message: 'Não foi possível salvar agora. Tente novamente.' };
  revalidatePath(`/app/aulas/${id.data}`);
  revalidatePath(`/app/cursos/${course.data}`);
  return { status: 'idle' };
}

/** Posição do vídeo, enviada de tempos em tempos pelo player; falha em silêncio (não bloqueia). */
export async function savePositionAction(id: string, positionSeconds: number): Promise<void> {
  const parsed = saveProgressRequestSchema.safeParse({
    positionSeconds: Math.floor(positionSeconds),
  });
  if (!lessonId.safeParse(id).success || !parsed.success) return;
  await saveLessonProgress(id, parsed.data);
}
