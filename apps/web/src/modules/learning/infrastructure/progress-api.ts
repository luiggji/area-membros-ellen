import type { SaveProgressRequest } from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

/** Grava o progresso de quem está logado (CF-084); a API confere aula e acesso. */
export async function saveLessonProgress(
  lessonId: string,
  body: SaveProgressRequest,
): Promise<boolean> {
  const response = await callApi(`/aulas/${encodeURIComponent(lessonId)}/progresso`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return response.ok;
}
