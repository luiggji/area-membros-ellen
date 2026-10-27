import { type AdminPlan, formatCents, PRICE_INTERVALS } from '@caixa-forte/contracts';

import { parseTimestamp } from '../domain/timestamp';
import { EditPlanForm, PublishPriceForm } from './plan-forms';

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** Um plano: preço vendável por frequência, histórico de versões e formulários do owner (CF-041). */
export function PlanCard({ plan }: { plan: AdminPlan }) {
  const sellable = (Object.keys(PRICE_INTERVALS) as (keyof typeof PRICE_INTERVALS)[]).map(
    (interval) => ({
      interval,
      price: plan.prices.find((p) => p.interval === interval && p.isSellable),
    }),
  );
  const history = plan.prices.filter((p) => !p.isSellable);

  return (
    <article className="flex flex-col gap-6 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-editorial text-2xl tracking-tight text-cf-text">{plan.name}</h3>
        <span className="text-sm text-cf-text-secondary">
          {plan.code} · {plan.active ? 'à venda' : 'inativo'}
        </span>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2">
        {sellable.map(({ interval, price }) => (
          <div key={interval} className="rounded-xl bg-cf-bg p-4">
            <dt className="text-sm text-cf-text-secondary">{PRICE_INTERVALS[interval]}</dt>
            <dd className="text-xl font-medium text-cf-text">
              {price ? formatCents(price.amountCents) : 'Sem preço à venda'}
            </dd>
            {price ? (
              <dd className="text-xs text-cf-text-secondary">
                desde {date.format(parseTimestamp(price.effectiveAt))}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      <section aria-label={`Novo preço de ${plan.name}`} className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-cf-text">Novo preço</h4>
        <PublishPriceForm planId={plan.id} />
      </section>

      {history.length > 0 ? (
        <section aria-label={`Preços anteriores de ${plan.name}`} className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-cf-text">
            Preços anteriores (valem para quem já assinou)
          </h4>
          <ul className="flex flex-col gap-1 text-sm text-cf-text-secondary">
            {history.map((price) => (
              <li key={price.id}>
                {PRICE_INTERVALS[price.interval]} · {formatCents(price.amountCents)} · desde{' '}
                {date.format(parseTimestamp(price.effectiveAt))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="group">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-cf-primary">
          Editar nome, descrição ou venda
        </summary>
        <div className="pt-4">
          <EditPlanForm plan={plan} />
        </div>
      </details>
    </article>
  );
}
