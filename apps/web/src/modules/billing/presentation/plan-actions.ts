'use server';

import { can } from '@caixa-forte/contracts';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

import {
  type CatalogFormState,
  submitCreatePlan,
  submitPublishPrice,
  submitUpdatePlan,
} from '../application/plan-use-cases';
import { plansApi } from '../infrastructure/plans-api';

/** Painel com MFA e permissão prices.manage (a API confere de novo). */
async function requirePricesPermission() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'prices.manage')) notFound();
}

async function run(
  submit: (input: Record<string, unknown>, api: typeof plansApi) => Promise<CatalogFormState>,
  form: FormData,
): Promise<CatalogFormState> {
  await requirePricesPermission();
  const result = await submit(Object.fromEntries(form), plansApi);
  if (result.status === 'success') revalidatePath('/admin/planos');
  return result;
}

export async function createPlanAction(_state: CatalogFormState, form: FormData) {
  return run(submitCreatePlan, form);
}

export async function updatePlanAction(_state: CatalogFormState, form: FormData) {
  return run(submitUpdatePlan, form);
}

export async function publishPriceAction(_state: CatalogFormState, form: FormData) {
  return run(submitPublishPrice, form);
}
