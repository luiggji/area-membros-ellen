import { type AdminPlan, adminPlanListSchema } from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

import type { CatalogApiResult, PlansApi } from '../application/plan-use-cases';

async function toResult(response: Response): Promise<CatalogApiResult> {
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

/** Catálogo de planos pela API (CF-041); a API exige owner com MFA (prices.manage). */
export const plansApi: PlansApi & { list(): Promise<AdminPlan[] | null> } = {
  async list() {
    const response = await callApi('/admin/planos');
    if (!response.ok) return null;
    const parsed = adminPlanListSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.plans : null;
  },
  create: async (body) => toResult(await callApi('/admin/planos', json('POST', body))),
  update: async (id, body) =>
    toResult(await callApi(`/admin/planos/${encodeURIComponent(id)}`, json('PATCH', body))),
  publishPrice: async (id, body) =>
    toResult(await callApi(`/admin/planos/${encodeURIComponent(id)}/precos`, json('POST', body))),
};
