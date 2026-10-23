import type { Database } from '@caixa-forte/contracts';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { ProfileRepository } from '../application/profile-use-cases';

type Client = SupabaseClient<Database>;
export type ProfileRow = Database['public']['Tables']['user_profiles']['Row'];

export interface PolicyWithConsent {
  id: string;
  kind: string;
  version: string;
  title: string;
  publishedAt: string | null;
  /** Aceite ativo do usuário nesta versão, se houver. */
  consent: { id: string; acceptedAt: string } | null;
}

/** Tudo que a página de perfil precisa, lido com a sessão do titular (RLS). */
export async function loadProfilePage(client: Client, userId: string) {
  const [profile, policies, consents] = await Promise.all([
    client.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
    // Rascunhos não aparecem (RLS): só o que foi publicado pode ser lido e aceito.
    client
      .from('policy_versions')
      .select('id, kind, version, title, published_at')
      .eq('status', 'published')
      .order('kind')
      .order('published_at', { ascending: false }),
    client.from('consents').select('id, policy_version_id, accepted_at').is('revoked_at', null),
  ]);

  // Só a versão publicada mais recente de cada tipo de documento.
  const latest = new Map<string, NonNullable<typeof policies.data>[number]>();
  for (const policy of policies.data ?? [])
    if (!latest.has(policy.kind)) latest.set(policy.kind, policy);

  const policiesWithConsent: PolicyWithConsent[] = [...latest.values()].map((policy) => {
    const consent = consents.data?.find((row) => row.policy_version_id === policy.id);
    return {
      id: policy.id,
      kind: policy.kind,
      version: policy.version,
      title: policy.title,
      publishedAt: policy.published_at,
      consent: consent ? { id: consent.id, acceptedAt: consent.accepted_at } : null,
    };
  });

  return { profile: profile.data, policies: policiesWithConsent };
}

export function supabaseProfileRepository(client: Client, userId: string): ProfileRepository {
  return {
    async save(input) {
      const { error } = await client.from('user_profiles').update(input).eq('id', userId);
      return !error;
    },
    async accept(policyVersionId) {
      const { error } = await client
        .from('consents')
        .insert({ user_id: userId, policy_version_id: policyVersionId });
      return !error;
    },
    async revoke(consentId) {
      const { error, count } = await client
        .from('consents')
        .update({ revoked_at: new Date().toISOString() }, { count: 'exact' })
        .eq('id', consentId)
        .is('revoked_at', null);
      return !error && count === 1;
    },
  };
}
