import { type DirectoryProfileInput, directoryProfileInputSchema } from '@caixa-forte/contracts';

import type { FormState } from '@/modules/identity/application/auth-use-cases';
import { fieldErrors } from '@/modules/identity/domain/credentials';

/** Gravação do próprio perfil público (CF-090); a RLS garante o titular. */
export interface DirectoryProfileRepository {
  save(input: DirectoryProfileInput): Promise<boolean>;
}

const FIELDS = ['displayName', 'city', 'state', 'areas', 'bio', 'links'] as const;
const text = (value: unknown) => (typeof value === 'string' ? value : '');

export async function saveDirectoryProfile(
  input: Record<string, unknown>,
  repo: DirectoryProfileRepository,
): Promise<FormState> {
  const values = Object.fromEntries(FIELDS.map((key) => [key, text(input[key])]));
  const parsed = directoryProfileInputSchema.safeParse(values);
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrors(parsed.error), values };
  if (!(await repo.save(parsed.data))) {
    return { status: 'error', message: 'Não foi possível salvar agora. Tente novamente.', values };
  }
  return { status: 'success', message: 'Perfil público salvo.' };
}

/**
 * Situação no diretório: só aparece quem tem perfil público e aceite ativo da versão publicada do
 * termo do diretório. Sem termo publicado, ninguém entra (o diretório ainda não abriu).
 */
export type DirectoryStatus =
  | { state: 'closed' }
  | { state: 'needs_profile'; policyVersionId: string }
  | { state: 'out'; policyVersionId: string; policyTitle: string }
  | { state: 'in'; consentId: string; policyTitle: string };

export function directoryStatus(
  policy: { id: string; title: string; consent: { id: string } | null } | null,
  hasProfile: boolean,
): DirectoryStatus {
  if (!policy) return { state: 'closed' };
  if (policy.consent)
    return { state: 'in', consentId: policy.consent.id, policyTitle: policy.title };
  if (!hasProfile) return { state: 'needs_profile', policyVersionId: policy.id };
  return { state: 'out', policyVersionId: policy.id, policyTitle: policy.title };
}
