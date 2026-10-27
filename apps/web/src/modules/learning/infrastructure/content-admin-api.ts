import { type AdminContent, adminContentSchema } from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

import type { ContentAdminApi, ContentApiResult } from '../application/content-use-cases';

async function toResult(response: Response): Promise<ContentApiResult> {
  if (response.ok) return { ok: true };
  const payload = (await response.json().catch(() => null)) as {
    fields?: Record<string, string>;
  } | null;
  return { ok: false, status: response.status, fields: payload?.fields };
}

const send = async (method: string, path: string, body: unknown) =>
  toResult(await callApi(`/admin/conteudo${path}`, { method, body: JSON.stringify(body) }));

/** Editor de conteúdo pela API (CF-081); a API exige owner com MFA (content.manage). */
export const contentAdminApi: ContentAdminApi & { tree(): Promise<AdminContent | null> } = {
  async tree() {
    const response = await callApi('/admin/conteudo');
    if (!response.ok) return null;
    const parsed = adminContentSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  },
  createCourse: (body) => send('POST', '/cursos', body),
  updateCourse: (id, body) => send('PATCH', `/cursos/${encodeURIComponent(id)}`, body),
  createModule: (courseId, body) =>
    send('POST', `/cursos/${encodeURIComponent(courseId)}/modulos`, body),
  updateModule: (id, body) => send('PATCH', `/modulos/${encodeURIComponent(id)}`, body),
};
