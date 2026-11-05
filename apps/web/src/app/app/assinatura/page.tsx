import { Card } from '@caixa-forte/ui';
import { BadgeCheck, Crown } from 'lucide-react';
import type { Metadata } from 'next';

import { describeAccess } from '@/modules/billing/domain/member-access';
import { loadMyAccess } from '@/modules/billing/infrastructure/supabase-access';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

export const metadata: Metadata = { title: 'Assinatura · Caixa Forte' };

/**
 * Assinatura (CF-046): estado de acesso real, lido no servidor a cada requisição. Plano,
 * cobranças e como alterar entram na Minha Assinatura completa (CF-047).
 */
export default async function SubscriptionPage() {
  const summary = describeAccess(await loadMyAccess(await createSupabaseServerClient()));
  const Icon = summary.active ? BadgeCheck : Crown;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-12">
      <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
        Assinatura
      </h1>
      <Card className="flex items-start gap-4 border border-cf-border sm:p-8">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary"
        >
          <Icon className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-cf-text">{summary.title}</h2>
          <p className="text-cf-text-secondary">{summary.description}</p>
        </div>
      </Card>
    </div>
  );
}
