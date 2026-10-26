import { EmptyState } from '@caixa-forte/ui';
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { describeRoles } from '@/modules/identity/domain/role-labels';
import { loadAdminGate } from '@/modules/identity/infrastructure/admin-gate';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Painel da equipe · Caixa Forte' };

/**
 * Entrada do painel (CF-034): prova a portaria (equipe + MFA). As ferramentas (planos, eventos,
 * inscrições, moderação) chegam com o CF-105 e os módulos; nada aqui é número inventado.
 */
export default async function AdminHomePage() {
  const { roles } = await loadAdminGate();
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
            <p className="mt-2">As ferramentas do painel chegam com os próximos módulos.</p>
          </>
        }
        action={
          <Link href="/app" className="text-sm text-cf-primary underline underline-offset-4">
            Ir para a área do membro
          </Link>
        }
      />
    </PublicFrame>
  );
}
