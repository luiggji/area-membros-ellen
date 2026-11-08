import { Button, buttonClasses, Card } from '@caixa-forte/ui';
import { LifeBuoy, Mail } from 'lucide-react';
import Link from 'next/link';

import { exampleFaq, exampleSubscription } from '../domain/community-fixtures';
import { hrefFor } from './nav-links';
import { ExampleTag, PageHeader, PrototypePage } from './page-parts';

/** Minha Assinatura (doc G §4.10): contrato em vigor, próxima cobrança, histórico e gestão. */
export function SubscriptionScreen() {
  const sub = exampleSubscription;
  return (
    <PrototypePage width="reading">
      <PageHeader title="Assinatura" summary="Seu plano, as cobranças e como gerenciar." />
      <Card className="flex flex-col gap-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-sm text-cf-text-secondary">
              Plano atual <ExampleTag />
            </p>
            <p className="font-editorial text-2xl text-cf-text">{sub.plan}</p>
          </div>
          <span className="rounded-full bg-cf-surface-muted px-3 py-1 text-sm font-medium text-cf-primary">
            {sub.status}
          </span>
        </div>
        <dl className="grid gap-4 border-t border-cf-border pt-5 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="text-cf-text-secondary">Valor contratado</dt>
            <dd className="font-medium text-cf-text tabular-nums">{sub.price}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-cf-text-secondary">Próxima cobrança</dt>
            <dd className="font-medium text-cf-text tabular-nums">{sub.nextCharge}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-cf-text-secondary">Pagamento</dt>
            <dd className="font-medium text-cf-text">{sub.method}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <Button disabled title="No produto, abre o portal seguro do meio de pagamento">
            Gerenciar assinatura
          </Button>
          <Link href={hrefFor('ajuda')} className={buttonClasses({ variant: 'link' })}>
            Como cancelar
          </Link>
        </div>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[22rem] text-left text-sm">
          <caption className="px-6 pt-5 pb-3 text-left font-medium text-cf-text">
            Histórico de cobranças
          </caption>
          <thead className="bg-cf-surface-muted text-xs text-cf-text-secondary">
            <tr>
              {['Data', 'Valor', 'Status'].map((column) => (
                <th key={column} scope="col" className="px-6 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cf-border">
            {sub.history.map((row) => (
              <tr key={row.date}>
                <td className="px-6 py-3 text-cf-text tabular-nums">{row.date}</td>
                <td className="px-6 py-3 text-cf-text tabular-nums">{row.amount}</td>
                <td className="px-6 py-3 text-cf-primary">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PrototypePage>
  );
}

/** Ajuda: perguntas frequentes e o canal de suporte operacional (CF-107). */
export function HelpScreen() {
  return (
    <PrototypePage width="reading">
      <PageHeader title="Ajuda" summary="Respostas rápidas e como falar com a equipe." />
      <section aria-labelledby="faq" className="flex flex-col gap-3">
        <h2 id="faq" className="flex items-center gap-2 font-editorial text-xl text-cf-text">
          Perguntas frequentes <ExampleTag />
        </h2>
        <ul className="flex flex-col divide-y divide-cf-border rounded-card border border-cf-border bg-cf-surface">
          {exampleFaq.map((item) => (
            <li key={item.question}>
              <details className="group px-5">
                <summary className="flex min-h-14 cursor-pointer items-center py-3 font-medium text-cf-text">
                  {item.question}
                </summary>
                <p className="pb-4 text-cf-text-secondary">{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
      <Card tone="muted" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary"
        >
          <LifeBuoy className="size-5" strokeWidth={1.6} />
        </span>
        <div className="flex flex-1 flex-col">
          <p className="font-medium text-cf-text">Ainda com dúvida?</p>
          <p className="text-sm text-cf-text-secondary">
            A equipe responde em dias úteis. Não envie dados de clientes no suporte.
          </p>
        </div>
        <Button variant="secondary" disabled title="O canal real de suporte entra com CF-107">
          <Mail aria-hidden className="size-4" strokeWidth={1.6} /> Falar com a equipe
        </Button>
      </Card>
    </PrototypePage>
  );
}
