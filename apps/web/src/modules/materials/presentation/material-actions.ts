'use server';

import {
  can,
  type CreateMaterialRequest,
  type PrepareMaterialUploadRequest,
} from '@caixa-forte/contracts';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

import { materialsAdminApi } from '../infrastructure/materials-admin-api';

/** Painel com MFA e permissão content.manage (a API confere de novo). */
async function guard() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'content.manage')) notFound();
}

export async function prepareMaterialUploadAction(file: PrepareMaterialUploadRequest) {
  await guard();
  return materialsAdminApi.prepare(file);
}

export async function createMaterialAction(body: CreateMaterialRequest) {
  await guard();
  const result = await materialsAdminApi.create(body);
  if (result.ok) revalidatePath('/admin/materiais');
  return result;
}

const materialId = z.uuid();

export async function setMaterialStatusAction(form: FormData) {
  await guard();
  const id = materialId.safeParse(form.get('materialId'));
  const status = form.get('status') === 'published' ? 'published' : 'draft';
  if (id.success) await materialsAdminApi.setStatus(id.data, status);
  revalidatePath('/admin/materiais');
}

export async function deleteMaterialAction(form: FormData) {
  await guard();
  const id = materialId.safeParse(form.get('materialId'));
  if (id.success) await materialsAdminApi.remove(id.data);
  revalidatePath('/admin/materiais');
}
