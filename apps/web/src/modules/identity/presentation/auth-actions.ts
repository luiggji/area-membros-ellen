'use server';

import { redirect } from 'next/navigation';

import { publicEnv } from '@/shared/config/env';
import { supabasePublicConfig } from '@/shared/lib/supabase/config';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

import * as auth from '../application/auth-use-cases';
import type { AuthResult, FormState } from '../application/auth-use-cases';
import type { AuthGateway } from '../application/ports';
import { supabaseAuthGateway } from '../infrastructure/supabase-auth-gateway';

/**
 * Ambiente sem Supabase (CF-012): toda operação falha como indisponível. Assim o formulário
 * continua validando os campos e devolve um erro honesto, em vez de a action estourar 500 (#148).
 */
const unavailableGateway: AuthGateway = {
  signUp: async () => 'unavailable',
  signIn: async () => 'unavailable',
  requestPasswordReset: async () => 'unavailable',
  updatePassword: async () => 'unavailable',
  signOut: async () => {},
};

/** Server Actions finas (CF-030): ligam cliente Supabase + adapter + casos de uso. */
async function gateway(): Promise<AuthGateway> {
  if (!supabasePublicConfig(publicEnv)) return unavailableGateway;
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
