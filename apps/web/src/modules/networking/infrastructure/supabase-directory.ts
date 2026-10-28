import type { Database } from '@caixa-forte/contracts';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { DirectoryProfileRepository } from '../application/directory-profile';

type Client = SupabaseClient<Database>;
export type DirectoryProfileRow = Database['public']['Tables']['directory_profiles']['Row'];

/** Próprio perfil público, lido com a sessão do titular (RLS). */
export async function loadDirectoryProfile(
  client: Client,
  userId: string,
): Promise<DirectoryProfileRow | null> {
  const { data } = await client
    .from('directory_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export function supabaseDirectoryRepository(
  client: Client,
  userId: string,
): DirectoryProfileRepository {
  return {
    async save(input) {
      const { error } = await client.from('directory_profiles').upsert({
        user_id: userId,
        display_name: input.displayName,
        city: input.city,
        state: input.state,
        areas: input.areas,
        bio: input.bio,
        links: input.links,
      });
      return !error;
    },
  };
}

/** Versão publicada mais recente do termo do diretório, com o texto (público por RLS). */
export async function loadDirectoryTerm(
  client: Client,
): Promise<{ id: string; title: string; version: string; bodyMd: string } | null> {
  const { data } = await client
    .from('policy_versions')
    .select('id, title, version, body_md')
    .eq('kind', 'directory')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data
    ? { id: data.id, title: data.title, version: data.version, bodyMd: data.body_md }
    : null;
}
