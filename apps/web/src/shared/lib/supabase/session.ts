import type { User } from '@supabase/supabase-js';
import { connection } from 'next/server';

import { publicEnv } from '@/shared/config/env';

import { supabasePublicConfig } from './config';
import { createSupabaseServerClient } from './server';

/**
 * Usuário da sessão, validado no Auth (`getUser` consulta o servidor; não confia só no cookie).
 * `null` sem sessão ou sem Supabase configurado (CF-030).
 */
export async function getSessionUser(): Promise<User | null> {
  // Sempre dinâmico, mesmo sem Supabase: sem isso, o build sem env (CI) pré-renderiza a página
  // e a área privada sai sem o nonce da CSP (a guarda do build barra).
  await connection();
  if (!supabasePublicConfig(publicEnv)) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
