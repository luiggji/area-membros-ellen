'use server';

import { revalidatePath } from 'next/cache';

import type { FormState } from '@/modules/identity/application/auth-use-cases';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

import { saveDirectoryProfile } from '../application/directory-profile';
import { supabaseDirectoryRepository } from '../infrastructure/supabase-directory';

/** Perfil público do diretório (CF-090): só o titular grava o próprio (RLS). */
export async function saveDirectoryProfileAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { status: 'error', message: 'Sua sessão expirou. Entre de novo.' };
  const repo = supabaseDirectoryRepository(await createSupabaseServerClient(), user.id);
  const result = await saveDirectoryProfile(Object.fromEntries(form), repo);
  if (result.status === 'success') revalidatePath('/app/perfil');
  return result;
}
