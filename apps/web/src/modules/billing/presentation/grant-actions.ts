'use server';

import { can } from '@caixa-forte/contracts';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

import { type GrantFormState, submitGrant } from '../application/grant-use-cases';
import { grantsApi } from '../infrastructure/grants-api';

/** Portaria das actions de concessão: painel com MFA e permissão access.grant (a API confere de novo). */
async function requireGrantPermission() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'access.grant')) notFound();
}

export async function grantAccessAction(
  _state: GrantFormState,
  form: FormData,
): Promise<GrantFormState> {
  await requireGrantPermission();
  const result = await submitGrant(Object.fromEntries(form), grantsApi);
  if (result.status === 'success') revalidatePath('/admin/acessos');
  return result;
}

export async function revokeGrantAction(form: FormData): Promise<void> {
  await requireGrantPermission();
  const id = form.get('id');
  if (typeof id === 'string') await grantsApi.revoke(id);
  revalidatePath('/admin/acessos');
}
