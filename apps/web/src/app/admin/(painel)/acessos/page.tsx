import { can } from '@caixa-forte/contracts';
import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { todayInBrasilia } from '@/modules/billing/domain/grant-status';
import { grantsApi } from '@/modules/billing/infrastructure/grants-api';
import { GrantForm } from '@/modules/billing/presentation/grant-form';
import { GrantList } from '@/modules/billing/presentation/grant-list';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Acessos concedidos · Caixa Forte' };

/**
 * Concessões manuais de acesso pago (CF-048): só o owner. Enquanto o gateway não entra (D-019),
 * é o único jeito de liberar a área paga — com validade, motivo e trilha de auditoria.
 */
export default async function AccessGrantsPage() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'access.grant')) notFound();
  const grants = await grantsApi.list();

  return (
    <PublicFrame>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 py-12">
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-cf-primary underline underline-offset-4">
            Painel da equipe
          </Link>
          <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
            Acessos concedidos
          </h1>
          <p className="text-cf-text-secondary">
            Libere a área de assinante para uma conta, com data de fim e motivo. Tudo fica
            registrado na trilha de auditoria.
          </p>
        </div>

        <section aria-labelledby="conceder" className="flex flex-col gap-4">
          <h2 id="conceder" className="text-lg font-medium text-cf-text">
            Nova concessão
          </h2>
          <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
            <GrantForm minDate={todayInBrasilia()} />
          </div>
        </section>

        <section aria-labelledby="lista" className="flex flex-col gap-4">
          <h2 id="lista" className="text-lg font-medium text-cf-text">
            Concessões
          </h2>
          <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
            {grants ? (
              <GrantList grants={grants} />
            ) : (
              <Notice tone="danger">
                Não foi possível carregar as concessões agora. Recarregue a página.
              </Notice>
            )}
          </div>
        </section>
      </div>
    </PublicFrame>
  );
}
