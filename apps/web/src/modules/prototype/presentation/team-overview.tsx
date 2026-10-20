import { Card } from '@caixa-forte/ui';
import { Inbox } from 'lucide-react';

import { adminNav } from '../domain/fixtures';
import { NavIcon } from '@/modules/navigation/presentation/nav-icon';

const indicators = ['Assinaturas ativas', 'Ingressos vendidos', 'Check-ins realizados'];

/**
 * Visão geral da equipe sem número inventado: indicadores e tabela vazios até existirem dados
 * reais (CF-105, CF-106). Mostra a densidade permitida no admin (doc G §4.9).
 */
export function TeamOverview() {
  return (
    <div className="flex flex-col gap-10 pt-4">
      <div className="flex flex-col gap-2">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase">
          Painel da equipe
        </p>
        <h1 className="font-editorial tracking-tight text-4xl text-cf-sidebar sm:text-5xl">
          Visão geral
        </h1>
        <p className="max-w-[60ch] text-cf-text-secondary">
          Owner vê números e gestão; comercial vê inscrições, suporte e check-in. Os papéis e o
          bloqueio de rota chegam com CF-032 e CF-034.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {indicators.map((label) => (
          <Card as="li" key={label} className="flex flex-col gap-1">
            <span className="text-sm text-cf-text-secondary">{label}</span>
            <span className="text-3xl font-medium text-cf-text tabular-nums">—</span>
            <span className="text-xs text-cf-text-secondary">Sem dados reais ainda</span>
          </Card>
        ))}
      </ul>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="px-6 pt-5 pb-3 text-left font-medium text-cf-text">
            Últimos pedidos
          </caption>
          <thead className="bg-cf-surface-muted text-xs text-cf-text-secondary">
            <tr>
              {['Pedido', 'Comprador', 'Status', 'Valor'].map((column) => (
                <th key={column} scope="col" className="px-6 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-cf-text-secondary">
                <Inbox aria-hidden className="mx-auto mb-2 size-5" strokeWidth={1.6} />
                Nenhum pedido ainda. A lista real chega com o checkout (CF-064).
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <section aria-labelledby="areas-titulo" className="flex flex-col gap-4">
        <h2 id="areas-titulo" className="text-sm font-medium text-cf-text">
          Áreas do painel
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminNav
            .filter((item) => item.slug)
            .map((item) => (
              <Card
                as="li"
                key={item.slug}
                id={item.slug}
                tone="muted"
                className="flex scroll-mt-6 items-start gap-4"
              >
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary"
                >
                  <NavIcon name={item.icon} className="size-5" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-cf-text">{item.label}</span>
                  <span className="text-sm text-cf-text-secondary">
                    Construída em {item.deliveredBy}
                  </span>
                </span>
              </Card>
            ))}
        </ul>
      </section>
    </div>
  );
}
