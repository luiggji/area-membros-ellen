import { type AdminGroup, adminGroupListSchema } from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

import type { GroupApiResult, GroupsApi } from '../application/group-use-cases';

async function toResult(response: Response): Promise<GroupApiResult> {
  if (response.ok) return { ok: true };
  const payload = (await response.json().catch(() => null)) as {
    fields?: Record<string, string>;
  } | null;
  return { ok: false, status: response.status, fields: payload?.fields };
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

/** Grupos pela API (CF-092); a API exige owner com MFA (content.manage). */
export const groupsApi: GroupsApi & { list(): Promise<AdminGroup[] | null> } = {
  async list() {
    const response = await callApi('/admin/grupos');
    if (!response.ok) return null;
    const parsed = adminGroupListSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.groups : null;
  },
  create: async (body) => toResult(await callApi('/admin/grupos', json('POST', body))),
  update: async (id, body) =>
    toResult(await callApi(`/admin/grupos/${encodeURIComponent(id)}`, json('PATCH', body))),
};
