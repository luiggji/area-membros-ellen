import { can } from '@caixa-forte/contracts';
import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { plansApi } from '@/modules/billing/infrastructure/plans-api';
import { PlanCard } from '@/modules/billing/presentation/plan-card';
import { CreatePlanForm } from '@/modules/billing/presentation/plan-forms';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Planos e preços · Caixa Forte' };

/**
 * Planos e preços (CF-041): só o owner. Preço novo vale para novas vendas, sem deploy; quem já
 * assina continua no preço contratado. Tudo vai para a trilha de auditoria.
 */
export default async function PlansPage() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'prices.manage')) notFound();
  const plans = await plansApi.list();

  return (
    <PublicFrame>
      <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-10 py-12">
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-cf-primary underline underline-offset-4">
            Painel da equipe
          </Link>
          <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
            Planos e preços
          </h1>
          <p className="text-cf-text-secondary">
            Um preço novo vale só para novas vendas. Quem já assina continua pagando o valor
            contratado. Toda alteração fica na trilha de auditoria.
          </p>
        </div>

        {plans ? (
          plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
        ) : (
          <Notice tone="danger">
            Não foi possível carregar os planos agora. Recarregue a página.
          </Notice>
        )}

        <section aria-labelledby="novo-plano" className="flex flex-col gap-4">
          <h2 id="novo-plano" className="text-lg font-medium text-cf-text">
            Novo plano
          </h2>
          <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
            <CreatePlanForm />
          </div>
        </section>
      </div>
    </PublicFrame>
  );
}
