import {
  type MemberMaterials,
  materialDownloadSchema,
  memberMaterialsSchema,
} from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

/** Cofre do membro pela API (CF-085). `null` = não foi possível carregar agora. */
export async function loadMaterials(): Promise<MemberMaterials | null> {
  const response = await callApi('/materiais');
  if (!response.ok) return null;
  const parsed = memberMaterialsSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

/**
 * Pede o link de download de 60 s. `forbidden` = sem acesso pago; `not_found` = material saiu do
 * Cofre; `failed` = API fora do ar ou erro.
 */
export async function requestDownload(
  id: string,
): Promise<{ url: string } | 'forbidden' | 'not_found' | 'failed'> {
  const response = await callApi(`/materiais/${encodeURIComponent(id)}/download`, {
    method: 'POST',
  });
  if (response.status === 401 || response.status === 403) return 'forbidden';
  if (response.status === 404 || response.status === 400) return 'not_found';
  if (!response.ok) return 'failed';
  const parsed = materialDownloadSchema.safeParse(await response.json());
  return parsed.success ? { url: parsed.data.url } : 'failed';
}
