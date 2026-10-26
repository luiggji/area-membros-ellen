import { buttonClasses, EmptyState } from '@caixa-forte/ui';
import { KeyRound } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { nextOnboardingStep } from '@/modules/identity/domain/onboarding';
import { describeRoles } from '@/modules/identity/domain/role-labels';
import { getSessionRoles } from '@/modules/identity/infrastructure/session-roles';
import { loadProfilePage } from '@/modules/identity/infrastructure/supabase-profile';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

export const metadata: Metadata = { title: 'Início · Caixa Forte' };

/**
 * Primeira página do membro logado (CF-030/CF-032): só dados reais da sessão e dos papéis. A home editorial com
 * jornada e cursos é o CF-101; o shell do membro já envolve a página (CF-171). Nada de conteúdo inventado.
 */
export default async function MemberHomePage() {
  const [user, roles] = await Promise.all([getSessionUser(), getSessionRoles()]);
  if (!user) return null; // o layout de /app já redireciona; isto só satisfaz o tipo
  // Primeiro acesso: o onboarding vem antes do início e retoma onde parou (CF-035).
  const { profile } = await loadProfilePage(await createSupabaseServerClient(), user.id);
  if (nextOnboardingStep(profile)) redirect('/app/jornada');
  const access = describeRoles(roles);
  const name = typeof user?.user_metadata.name === 'string' ? user.user_metadata.name : null;

  return (
    <EmptyState
      size="page"
      icon={<KeyRound className="size-5" />}
      title={name ? `Olá, ${name}.` : 'Olá.'}
      description={
        <>
          <p>
            Você entrou como <strong className="text-cf-text">{user?.email}</strong>.
          </p>
          {access ? (
            <p className="mt-2">
              Seu acesso: <strong className="text-cf-text">{access}</strong>.
            </p>
          ) : null}
          <p className="mt-2">Sua área de membro está sendo preparada.</p>
        </>
      }
      action={
        <Link href="/app/perfil" className={buttonClasses()}>
          Seu perfil
        </Link>
      }
    />
  );
}
