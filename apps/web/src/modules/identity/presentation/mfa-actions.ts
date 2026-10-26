'use server';

import { notFound, redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

import {
  confirmCode,
  MFA_MESSAGES,
  type MfaState,
  startEnrollment,
} from '../application/mfa-use-cases';
import { loadAdminGate } from '../infrastructure/admin-gate';
import { supabaseMfaGateway } from '../infrastructure/supabase-mfa';

/**
 * Server Actions do segundo fator (CF-034). São endpoints públicos, então repetem a portaria do
 * /admin: só a equipe usa, e um novo fator só é cadastrado por quem ainda não tem um verificado.
 */
async function gate() {
  const { access } = await loadAdminGate();
  if (access === 'login') redirect('/entrar?next=/admin');
  if (access === 'not_found') notFound();
  return access;
}

export async function startEnrollmentAction(): Promise<MfaState> {
  if ((await gate()) !== 'enroll_mfa') {
    return { status: 'error', message: MFA_MESSAGES.enrollFailed };
  }
  return startEnrollment(supabaseMfaGateway(await createSupabaseServerClient()));
}

export async function confirmCodeAction(_state: MfaState, form: FormData): Promise<MfaState> {
  if ((await gate()) === 'allow') redirect('/admin');
  const result = await confirmCode(
    Object.fromEntries(form),
    supabaseMfaGateway(await createSupabaseServerClient()),
  );
  if (result.status === 'redirect') redirect(result.to);
  return result;
}
