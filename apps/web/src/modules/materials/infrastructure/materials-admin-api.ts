import {
  type AdminMaterial,
  adminMaterialsSchema,
  type CreateMaterialRequest,
  type PrepareMaterialUploadRequest,
  prepareMaterialUploadResponseSchema,
} from '@caixa-forte/contracts';
import type { z } from 'zod';

import { callApi } from '@/shared/lib/api/authenticated-api';

import type { MaterialApiResult } from '../application/upload-material';

async function toResult<T>(
  response: Response,
  schema?: z.ZodType<T>,
): Promise<MaterialApiResult<T>> {
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      code: typeof payload?.message === 'string' ? payload.message : undefined,
      fields: payload?.fields as Record<string, string> | undefined,
    };
  }
  if (!schema) return { ok: true, data: payload as T };
  const parsed = schema.safeParse(payload);
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, status: 502 };
}

const send = (method: string, path: string, body?: unknown) =>
  callApi(`/admin/materiais${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

/** Cofre na mão da owner pela API (CF-085); a API exige owner com MFA (content.manage). */
export const materialsAdminApi = {
  async list(): Promise<AdminMaterial[] | null> {
    const response = await callApi('/admin/materiais');
    if (!response.ok) return null;
    const parsed = adminMaterialsSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.materials : null;
  },
  prepare: async (body: PrepareMaterialUploadRequest) =>
    toResult(await send('POST', '/envios', body), prepareMaterialUploadResponseSchema),
  create: async (body: CreateMaterialRequest) =>
    toResult<{ id: string }>(await send('POST', '', body)),
  setStatus: async (id: string, status: 'draft' | 'published') =>
    toResult(await send('PATCH', `/${encodeURIComponent(id)}`, { status })),
  remove: async (id: string) => toResult(await send('DELETE', `/${encodeURIComponent(id)}`)),
};
