import { can } from '@caixa-forte/contracts';
import { buttonClasses, EmptyState } from '@caixa-forte/ui';
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { describeRoles } from '@/modules/identity/domain/role-labels';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Painel da equipe · Caixa Forte' };

/**
 * Entrada do painel (CF-034): prova a portaria (equipe + MFA). Primeira ferramenta: concessão
 * manual (CF-048, owner). O resto (planos, eventos, moderação) chega com o CF-105 e os módulos.
 */
export default async function AdminHomePage() {
  const { roles } = await requireAdminPanel();
  return (
    <PublicFrame>
      <EmptyState
        size="page"
        icon={<ShieldCheck className="size-5" />}
        title="Painel da equipe"
        description={
          <>
            <p>
              Acesso verificado em duas etapas. Seu papel:{' '}
              <strong className="text-cf-text">{describeRoles(roles)}</strong>.
            </p>
            <p className="mt-2">
              {can(roles, 'access.grant')
                ? 'Por enquanto, a ferramenta disponível é a concessão manual de acesso.'
                : 'As ferramentas do painel chegam com os próximos módulos.'}
            </p>
          </>
        }
        action={
          can(roles, 'access.grant') ? (
            <Link href="/admin/acessos" className={buttonClasses()}>
              Acessos concedidos
            </Link>
          ) : (
            <Link href="/app" className="text-sm text-cf-primary underline underline-offset-4">
              Ir para a área do membro
            </Link>
          )
        }
      />
    </PublicFrame>
  );
}
