'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

import type { FormState } from '../application/auth-use-cases';
import { saveOnboardingStep } from '../application/onboarding-use-cases';
import * as profile from '../application/profile-use-cases';
import {
  supabaseOnboardingRepository,
  supabaseProfileRepository,
} from '../infrastructure/supabase-profile';

/** Server Actions do perfil (CF-031): só para quem está logado; a RLS restringe ao titular. */
async function repository() {
  const user = await getSessionUser();
  if (!user) return null;
  return supabaseProfileRepository(await createSupabaseServerClient(), user.id);
}

const signedOut: FormState = { status: 'error', message: 'Sua sessão expirou. Entre de novo.' };

export async function updateProfileAction(_state: FormState, form: FormData): Promise<FormState> {
  const repo = await repository();
  if (!repo) return signedOut;
  const result = await profile.updateProfile(Object.fromEntries(form), repo);
  if (result.status === 'success') revalidatePath('/app', 'layout');
  return result;
}

export async function acceptPolicyAction(_state: FormState, form: FormData): Promise<FormState> {
  const repo = await repository();
  if (!repo) return signedOut;
  const result = await profile.acceptPolicy(form.get('policyVersionId'), repo);
  if (result.status === 'success') revalidatePath('/app/perfil');
  return result;
}

export async function revokeConsentAction(_state: FormState, form: FormData): Promise<FormState> {
  const repo = await repository();
  if (!repo) return signedOut;
  const result = await profile.revokeConsent(form.get('consentId'), repo);
  if (result.status === 'success') revalidatePath('/app/perfil');
  return result;
}

/** Uma etapa do onboarding (CF-035): grava e segue; a última volta ao início. */
export async function saveOnboardingStepAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return signedOut;
  const repo = supabaseOnboardingRepository(await createSupabaseServerClient(), user.id);
  const result = await saveOnboardingStep(Object.fromEntries(form), repo);
  if (result.status !== 'redirect') return result;
  revalidatePath('/app', 'layout');
  redirect(result.to);
}
