'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/shared/lib/supabase/session';

import { type MembershipState, submitJoin, submitLeave } from '../application/membership-use-cases';
import { membershipApi } from '../infrastructure/community-api';

/**
 * Participar e sair (CF-093). A sessão é conferida aqui só para a pessoa deslogada cair no
 * login em vez de ver uma mensagem de assinatura; quem decide o acesso é a API (RequireAccess).
 */
async function run(
  submit: (input: Record<string, unknown>, api: typeof membershipApi) => Promise<MembershipState>,
  form: FormData,
): Promise<MembershipState> {
  if (!(await getSessionUser())) redirect('/entrar?next=/app/comunidade');
  const result = await submit(Object.fromEntries(form), membershipApi);
  if (result.status === 'success') revalidatePath('/app/comunidade');
  return result;
}

export async function joinGroupAction(_state: MembershipState, form: FormData) {
  return run(submitJoin, form);
}

export async function leaveGroupAction(_state: MembershipState, form: FormData) {
  return run(submitLeave, form);
}
