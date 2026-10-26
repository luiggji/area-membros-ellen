import { type AccessGrant, accessGrantListSchema } from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

import type { GrantApiResult, GrantsApi } from '../application/grant-use-cases';

/** Concessões manuais pela API (CF-048); a API exige owner com MFA (access.grant). */
export const grantsApi: GrantsApi & {
  list(): Promise<AccessGrant[] | null>;
  revoke(id: string): Promise<boolean>;
} = {
  async list() {
    const response = await callApi('/admin/acessos');
    if (!response.ok) return null;
    const parsed = accessGrantListSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.grants : null;
  },

  async grant(body): Promise<GrantApiResult> {
    const response = await callApi('/admin/acessos', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true };
    const payload = (await response.json().catch(() => null)) as {
      fields?: Record<string, string>;
      message?: string;
    } | null;
    return {
      ok: false,
      status: response.status,
      fields: payload?.fields,
      message: payload?.message,
    };
  },

  async revoke(id) {
    const response = await callApi(`/admin/acessos/${encodeURIComponent(id)}/revogar`, {
      method: 'POST',
    });
    return response.ok;
  },
};
