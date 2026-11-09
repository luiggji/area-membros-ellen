import type { Metadata } from 'next';

import { loadProfilePage } from '@/modules/identity/infrastructure/supabase-profile';
import { PoliciesSection } from '@/modules/identity/presentation/policies-section';
import { ProfileForm } from '@/modules/identity/presentation/profile-form';
import { directoryStatus } from '@/modules/networking/application/directory-profile';
import {
  loadDirectoryProfile,
  loadDirectoryTerm,
} from '@/modules/networking/infrastructure/supabase-directory';
import { DirectorySection } from '@/modules/networking/presentation/directory-section';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

export const metadata: Metadata = { title: 'Seu perfil · Caixa Forte' };

/**
 * Perfil e privacidade do membro (CF-031, rota `/app/perfil` do PRD §4.2) e o perfil público
 * opcional do diretório (CF-090).
 */
export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null; // o layout de /app já redireciona; isto só satisfaz o tipo
  const client = await createSupabaseServerClient();
  const [{ profile, policies }, directoryProfile, term] = await Promise.all([
    loadProfilePage(client, user.id),
    loadDirectoryProfile(client, user.id),
    loadDirectoryTerm(client),
  ]);
  const status = directoryStatus(
    policies.find((policy) => policy.kind === 'directory') ?? null,
    directoryProfile !== null,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
          Seu perfil
        </h1>
        <p className="text-cf-text-secondary">
          Estes dados não aparecem para outros membros. Entrar no diretório de membros será sempre
          uma escolha sua.
        </p>
      </div>

      <section aria-labelledby="dados" className="flex flex-col gap-4">
        <h2 id="dados" className="text-lg font-medium text-cf-text">
          Dados pessoais
        </h2>
        <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
          <p className="mb-5 text-sm text-cf-text-secondary">
            E-mail da conta: <strong className="text-cf-text">{user.email}</strong>
          </p>
          <ProfileForm profile={profile} />
        </div>
      </section>

      <section aria-labelledby="diretorio" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="diretorio" className="text-lg font-medium text-cf-text">
            Diretório de membros
          </h2>
          <p className="text-sm text-cf-text-secondary">
            Aparecer é opcional. Outros assinantes veem só o seu perfil público; e-mail e telefone
            nunca aparecem.
          </p>
        </div>
        <DirectorySection profile={directoryProfile} status={status} term={term?.bodyMd ?? null} />
      </section>

      <section aria-labelledby="termos" className="flex flex-col gap-4">
        <h2 id="termos" className="text-lg font-medium text-cf-text">
          Termos e privacidade
        </h2>
        <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
          <PoliciesSection policies={policies} />
        </div>
      </section>
    </div>
  );
}
