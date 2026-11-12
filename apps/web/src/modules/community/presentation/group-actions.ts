'use server';

import { can } from '@caixa-forte/contracts';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

import {
  type GroupFormState,
  submitCreateGroup,
  submitUpdateGroup,
} from '../application/group-use-cases';
import { groupsApi } from '../infrastructure/groups-api';

/** Painel com MFA e permissão content.manage (a API confere de novo). */
async function requireGroupsPermission() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'content.manage')) notFound();
}

async function run(
  submit: (input: Record<string, unknown>, api: typeof groupsApi) => Promise<GroupFormState>,
  form: FormData,
): Promise<GroupFormState> {
  await requireGroupsPermission();
  const result = await submit(Object.fromEntries(form), groupsApi);
  if (result.status === 'success') revalidatePath('/admin/grupos');
  return result;
}

export async function createGroupAction(_state: GroupFormState, form: FormData) {
  return run(submitCreateGroup, form);
}

export async function updateGroupAction(_state: GroupFormState, form: FormData) {
  return run(submitUpdateGroup, form);
}
