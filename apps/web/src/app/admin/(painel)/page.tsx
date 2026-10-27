import { can, type Permission } from '@caixa-forte/contracts';
import { buttonClasses, EmptyState } from '@caixa-forte/ui';
import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { describeRoles } from '@/modules/identity/domain/role-labels';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Painel da equipe · Caixa Forte' };

/** Ferramentas já existentes, cada uma atrás da sua permissão (a API confere de novo). */
const TOOLS: { href: string; label: string; permission: Permission }[] = [
  { href: '/admin/planos', label: 'Planos e preços', permission: 'prices.manage' },
  { href: '/admin/acessos', label: 'Acessos concedidos', permission: 'access.grant' },
];

/**
 * Entrada do painel (CF-034): prova a portaria (equipe + MFA) e lista só as ferramentas que o
 * papel pode usar. O resto (eventos, conteúdo, moderação) chega com o CF-105 e os módulos.
 */
export default async function AdminHomePage() {
  const { roles } = await requireAdminPanel();
  const tools = TOOLS.filter((tool) => can(roles, tool.permission));
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
            {tools.length === 0 ? (
              <p className="mt-2">As ferramentas do seu papel chegam com os próximos módulos.</p>
            ) : null}
          </>
        }
        action={
          tools.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {tools.map((tool, index) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={buttonClasses({ variant: index === 0 ? 'primary' : 'secondary' })}
                >
                  {tool.label}
                </Link>
              ))}
            </div>
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
