import { EmptyState } from '@caixa-forte/ui';
import { KeyRound } from 'lucide-react';
import type { Metadata } from 'next';

import { describeRoles } from '@/modules/identity/domain/role-labels';
import { getSessionRoles } from '@/modules/identity/infrastructure/session-roles';
import { SignOutButton } from '@/modules/identity/presentation/auth-forms';
import { getSessionUser } from '@/shared/lib/supabase/session';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Início · Caixa Forte' };

/**
 * Primeira página do membro logado (CF-030/CF-032): só dados reais da sessão e dos papéis. A home editorial com
 * jornada e cursos é o CF-101; o shell do membro entra junto. Nada de conteúdo inventado.
 */
export default async function MemberHomePage() {
  const [user, roles] = await Promise.all([getSessionUser(), getSessionRoles()]);
  const access = describeRoles(roles);
  const name = typeof user?.user_metadata.name === 'string' ? user.user_metadata.name : null;

  return (
    <PublicFrame>
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
        action={<SignOutButton />}
      />
    </PublicFrame>
  );
}
