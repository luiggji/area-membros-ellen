import { type ProfileInput, profileInputSchema } from '@caixa-forte/contracts';

import { fieldErrors } from '../domain/credentials';
import type { FormState } from './auth-use-cases';

/** Gravação do perfil e dos consentimentos do próprio usuário (CF-031); a RLS garante o titular. */
export interface ProfileRepository {
  save(input: ProfileInput): Promise<boolean>;
  accept(policyVersionId: string): Promise<boolean>;
  revoke(consentId: string): Promise<boolean>;
}

export const PROFILE_MESSAGES = {
  saved: 'Perfil salvo.',
  saveFailed: 'Não foi possível salvar agora. Tente novamente.',
  consentFailed: 'Não foi possível registrar agora. Tente novamente.',
} as const;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

export async function updateProfile(
  input: Record<string, unknown>,
  repo: ProfileRepository,
): Promise<FormState> {
  const values = Object.fromEntries(
    ['name', 'city', 'state', 'professional_stage', 'bio'].map((key) => [key, text(input[key])]),
  );
  const parsed = profileInputSchema.safeParse(values);
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrors(parsed.error), values };
  if (!(await repo.save(parsed.data))) {
    return { status: 'error', message: PROFILE_MESSAGES.saveFailed, values };
  }
  return { status: 'success', message: PROFILE_MESSAGES.saved };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Aceite de uma versão publicada; o banco recusa rascunho e aceite em nome de outra pessoa. */
export async function acceptPolicy(id: unknown, repo: ProfileRepository): Promise<FormState> {
  if (typeof id !== 'string' || !UUID.test(id) || !(await repo.accept(id))) {
    return { status: 'error', message: PROFILE_MESSAGES.consentFailed };
  }
  return { status: 'success', message: 'Aceite registrado.' };
}

export async function revokeConsent(id: unknown, repo: ProfileRepository): Promise<FormState> {
  if (typeof id !== 'string' || !UUID.test(id) || !(await repo.revoke(id))) {
    return { status: 'error', message: PROFILE_MESSAGES.consentFailed };
  }
  return { status: 'success', message: 'Consentimento revogado. O histórico fica registrado.' };
}
