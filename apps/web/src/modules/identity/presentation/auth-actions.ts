'use server';

import { redirect } from 'next/navigation';

import { publicEnv } from '@/shared/config/env';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

import * as auth from '../application/auth-use-cases';
import type { AuthResult, FormState } from '../application/auth-use-cases';
import { supabaseAuthGateway } from '../infrastructure/supabase-auth-gateway';

/** Server Actions finas (CF-030): ligam cliente Supabase + adapter + casos de uso. */
async function gateway() {
  return supabaseAuthGateway(await createSupabaseServerClient());
}

function finish(result: AuthResult): FormState {
  if (result.status === 'redirect') redirect(result.to);
  return result;
}

// A URL dos links de e-mail vem da configuração, nunca do Host da requisição (host injection).
const appUrl = () => publicEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

export async function signUpAction(_state: FormState, form: FormData): Promise<FormState> {
  return finish(await auth.signUp(Object.fromEntries(form), await gateway(), appUrl()));
}

export async function signInAction(_state: FormState, form: FormData): Promise<FormState> {
  return finish(await auth.signIn(Object.fromEntries(form), await gateway()));
}

export async function requestPasswordResetAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  return finish(
    await auth.requestPasswordReset(Object.fromEntries(form), await gateway(), appUrl()),
  );
}

export async function updatePasswordAction(_state: FormState, form: FormData): Promise<FormState> {
  return finish(await auth.updatePassword(Object.fromEntries(form), await gateway()));
}

export async function signOutAction(): Promise<void> {
  finish(await auth.signOut(await gateway()));
}
