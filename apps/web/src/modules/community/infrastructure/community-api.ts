import {
  type Feed,
  feedSchema,
  type MemberGroupList,
  memberGroupListSchema,
} from '@caixa-forte/contracts';
import type { ZodType } from 'zod';

import { callApi } from '@/shared/lib/api/authenticated-api';

/**
 * A tela precisa separar três motivos de não haver conteúdo, porque dizem coisas diferentes
 * para quem está olhando (CF-093):
 * - `indisponivel`: módulo ainda desligado no ambiente (404 da feature flag, CF-158);
 * - `sem_acesso`: sem assinatura vigente (403 do paywall, CF-046);
 * - `null`: API fora do ar ou resposta fora do contrato.
 */
export type CommunityLoad<T> = T | 'indisponivel' | 'sem_acesso' | null;

async function load<T>(path: string, schema: ZodType<T>): Promise<CommunityLoad<T>> {
  const response = await callApi(path);
  if (response.status === 404) return 'indisponivel';
  if (response.status === 401 || response.status === 403) return 'sem_acesso';
  if (!response.ok) return null;
  const parsed = schema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

export function loadGroups(): Promise<CommunityLoad<MemberGroupList>> {
  return load('/comunidade/grupos', memberGroupListSchema);
}

export function loadFeed(): Promise<CommunityLoad<Feed>> {
  return load('/comunidade/feed', feedSchema);
}

/** Resultado de entrar ou sair; `nao_encontrado` = o grupo saiu do ar enquanto a tela estava aberta. */
export type MembershipResult = 'ok' | 'sem_acesso' | 'nao_encontrado' | 'falhou';

async function change(groupId: string, method: 'POST' | 'DELETE'): Promise<MembershipResult> {
  const response = await callApi(`/comunidade/grupos/${encodeURIComponent(groupId)}/participar`, {
    method,
  });
  if (response.ok) return 'ok';
  if (response.status === 401 || response.status === 403) return 'sem_acesso';
  if (response.status === 404) return 'nao_encontrado';
  return 'falhou';
}

export const membershipApi = {
  join: (groupId: string) => change(groupId, 'POST'),
  leave: (groupId: string) => change(groupId, 'DELETE'),
};
