import { type LessonView, lessonViewSchema } from '@caixa-forte/contracts';
import { cache } from 'react';

import { callApi } from '@/shared/lib/api/authenticated-api';

/**
 * Aula no player (CF-083): `not_found` quando não está liberada ou o endereço é inválido; `null`
 * quando não foi possível carregar. Uma chamada por requisição (página e título).
 */
export const loadLesson = cache(async function loadLesson(
  id: string,
): Promise<LessonView | 'not_found' | null> {
  const response = await callApi(`/aulas/${encodeURIComponent(id)}`);
  if (response.status === 404 || response.status === 400) return 'not_found';
  if (!response.ok) return null;
  const parsed = lessonViewSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
});
