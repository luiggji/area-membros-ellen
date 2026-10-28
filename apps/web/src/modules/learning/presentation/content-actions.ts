'use server';

import { can } from '@caixa-forte/contracts';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

import {
  type ContentFormState,
  submitCreateCourse,
  submitCreateLesson,
  submitCreateModule,
  submitSaveLessonContent,
  submitUpdateCourse,
  submitUpdateLesson,
  submitUpdateModule,
} from '../application/content-use-cases';
import { contentAdminApi } from '../infrastructure/content-admin-api';

/** Painel com MFA e permissão content.manage (a API confere de novo). */
async function run(
  submit: (
    input: Record<string, unknown>,
    api: typeof contentAdminApi,
  ) => Promise<ContentFormState>,
  form: FormData,
): Promise<ContentFormState> {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'content.manage')) notFound();
  const result = await submit(Object.fromEntries(form), contentAdminApi);
  if (result.status === 'success') revalidatePath('/admin/conteudo');
  return result;
}

export async function createCourseAction(_state: ContentFormState, form: FormData) {
  return run(submitCreateCourse, form);
}

export async function updateCourseAction(_state: ContentFormState, form: FormData) {
  return run(submitUpdateCourse, form);
}

export async function createModuleAction(_state: ContentFormState, form: FormData) {
  return run(submitCreateModule, form);
}

export async function updateModuleAction(_state: ContentFormState, form: FormData) {
  return run(submitUpdateModule, form);
}

export async function createLessonAction(_state: ContentFormState, form: FormData) {
  return run(submitCreateLesson, form);
}

export async function updateLessonAction(_state: ContentFormState, form: FormData) {
  return run(submitUpdateLesson, form);
}

export async function saveLessonContentAction(_state: ContentFormState, form: FormData) {
  return run(submitSaveLessonContent, form);
}
