import { Button, Card, cn, TextField } from '@caixa-forte/ui';
import { CircleAlert, CircleCheck, CircleX } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  type CheckinResult,
  checkinFeedback,
  exampleChannelReport,
  exampleContent,
  exampleEvents,
  exampleKpis,
  exampleOrders,
  exampleReports,
  exampleSignups,
  type ReportPeriod,
} from '../domain/team-fixtures';
import { teamHref } from './nav-links';
import { ExampleTag, LinkTabs } from './page-parts';

/** Cabeçalho das telas da equipe: mais funcional que editorial (doc G §4.9). */
function TeamHeader({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase">
            Painel da equipe
          </p>
          <h1 className="font-editorial text-3xl tracking-tight text-cf-sidebar sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-[60ch] text-cf-text-secondary">{summary}</p>
        </div>
        <ExampleTag />
      </div>
      {children}
    </header>
  );
}

/** Tabela densa com rolagem horizontal contida no mobile. */
function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="px-6 pt-5 pb-3 text-left font-medium text-cf-text">{caption}</caption>
        <thead className="bg-cf-surface-muted text-xs text-cf-text-secondary">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-6 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cf-border">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-3 text-cf-text tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Status({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'alert';
}) {
  return (
    <span className={cn('font-medium', tone === 'alert' ? 'text-danger' : 'text-cf-primary')}>
      {children}
    </span>
  );
}

/** Barras simples com título, fonte e alternativa textual (STYLE_GUIDE: gráficos do admin). */
function SignupsChart() {
  const max = Math.max(...exampleSignups.map((item) => item.value));
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium text-cf-text">Novas assinaturas por mês</h2>
        <p className="text-xs text-cf-text-secondary">Fonte: pagamentos confirmados (exemplo).</p>
      </div>
      <div aria-hidden className="flex h-40 items-end gap-3">
        {exampleSignups.map((item) => (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs text-cf-text tabular-nums">{item.value}</span>
            <div
              className="w-full rounded-t-md bg-cf-primary"
              style={{ height: `${((item.value / max) * 7).toFixed(2)}rem` }}
            />
            <span className="text-xs text-cf-text-secondary">{item.month}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Novas assinaturas por mês</caption>
        <tbody>
          {exampleSignups.map((item) => (
            <tr key={item.month}>
              <th scope="row">{item.month}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** Visão geral; números financeiros, gráfico e pedidos só para quem tem `finance.read`. */
export function TeamOverviewScreen({ finance }: { finance: boolean }) {
  const kpis = exampleKpis.filter((kpi) => finance || !('finance' in kpi));
  return (
    <div className="flex flex-col gap-8 pt-4 pb-12">
      <TeamHeader
        title="Visão geral"
        summary="Como estão assinaturas, ingressos e recebimentos. O comercial vê só inscrições e check-in."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card as="li" key={kpi.label} className="flex flex-col gap-1">
            <span className="text-sm text-cf-text-secondary">{kpi.label}</span>
            <span className="text-3xl font-medium text-cf-text tabular-nums">{kpi.value}</span>
            <span className="text-xs text-cf-text-secondary">{kpi.delta}</span>
          </Card>
        ))}
      </ul>
      {finance && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
          <SignupsChart />
          <DataTable
            caption="Últimos pedidos"
            columns={['Pedido', 'Comprador', 'Item', 'Status', 'Valor']}
            rows={exampleOrders.map((order) => [
              order.id,
              order.buyer,
              order.item,
              <Status key="s" tone={order.status === 'Pago' ? 'neutral' : 'alert'}>
                {order.status}
              </Status>,
              order.amount,
            ])}
          />
        </div>
      )}
    </div>
  );
}

export function EventsAdminScreen() {
  return (
    <div className="flex flex-col gap-8 pt-4 pb-12">
      <TeamHeader
        title="Eventos e lotes"
        summary="Edições do Café, capacidade, lote atual e vendas."
      >
        <div>
          <Button disabled title="Na demonstração, nada é criado">
            Novo evento
          </Button>
        </div>
      </TeamHeader>
      <DataTable
        caption="Eventos"
        columns={['Evento', 'Data', 'Vendidos', 'Lote atual', 'Status', '']}
        rows={exampleEvents.map((event) => [
          <span key="t" className="font-medium">
            {event.title}
          </span>,
          event.date,
          `${event.sold} de ${event.capacity}`,
          event.lot,
          <Status key="s">{event.status}</Status>,
          <Link
            key="c"
            href={teamHref('checkin')}
            className="text-cf-primary underline underline-offset-4"
          >
            Check-in
          </Link>,
        ])}
      />
    </div>
  );
}

const feedbackIcon = { ok: CircleCheck, warn: CircleAlert, error: CircleX };
const feedbackTone = {
  ok: 'border-success bg-success/10 text-success',
  warn: 'border-warning bg-warning/10 text-warning',
  error: 'border-danger bg-danger/10 text-danger',
};

/** Check-in (doc G §4.8): funcional acima do decorativo, feedback grande e inequívoco. */
export function CheckinScreen({ result }: { result?: CheckinResult }) {
  const feedback = result ? checkinFeedback[result] : undefined;
  const Icon = feedback ? feedbackIcon[feedback.tone] : null;
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-4 pb-12">
      <TeamHeader
        title="Check-in"
        summary="Café Estratégico · Curitiba · 06/12 · 0 de 46 presentes"
      />
      <Card className="flex flex-col gap-4">
        <form action={teamHref('checkin')} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField name="codigo" label="Código do QR ou nome" autoComplete="off" />
          </div>
          <Button type="submit" name="resultado" value="valido">
            Validar
          </Button>
        </form>
        <p className="text-sm text-cf-text-secondary">
          Ver estados:{' '}
          {(['valido', 'usado', 'invalido'] as const).map((state, index) => (
            <span key={state}>
              {index > 0 && ' · '}
              <Link
                href={`${teamHref('checkin')}?resultado=${state}`}
                className="text-cf-primary underline underline-offset-4"
              >
                {checkinFeedback[state].title.toLowerCase()}
              </Link>
            </span>
          ))}
        </p>
      </Card>
      {feedback && Icon && (
        <div
          role="status"
          className={cn(
            'flex items-center gap-4 rounded-card border-2 p-6 sm:p-8',
            feedbackTone[feedback.tone],
          )}
        >
          <Icon aria-hidden className="size-12 shrink-0" strokeWidth={1.6} />
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-semibold sm:text-3xl">{feedback.title}</p>
            <p className="text-cf-text">{feedback.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContentAdminScreen() {
  return (
    <div className="flex flex-col gap-8 pt-4 pb-12">
      <TeamHeader
        title="Conteúdo"
        summary="Cursos, aulas e materiais: rascunho, programado ou publicado."
      >
        <div className="flex flex-wrap gap-3">
          <Button disabled title="Na demonstração, nada é criado">
            Novo curso
          </Button>
          <Button variant="secondary" disabled title="Na demonstração, nada é enviado">
            Enviar material
          </Button>
        </div>
      </TeamHeader>
      <DataTable
        caption="Conteúdos"
        columns={['Título', 'Tipo', 'Status', 'Atualizado']}
        rows={exampleContent.map((item) => [
          <span key="t" className="font-medium">
            {item.title}
          </span>,
          item.kind,
          <Status key="s">{item.status}</Status>,
          item.updated,
        ])}
      />
    </div>
  );
}

export function ModerationScreen() {
  return (
    <div className="flex flex-col gap-8 pt-4 pb-12">
      <TeamHeader
        title="Moderação"
        summary="Denúncias da comunidade. Quem denunciou nunca aparece para quem publicou."
      />
      <ul className="flex flex-col gap-3">
        {exampleReports.map((report) => {
          const open = report.status === 'Aberta';
          return (
            <Card as="li" key={report.target} className="flex flex-wrap items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-medium text-cf-text">{report.target}</p>
                <p className="text-sm text-cf-text-secondary">
                  Motivo: {report.reason} · {report.when}
                </p>
              </div>
              {open ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" disabled title="Na demonstração, nada é alterado">
                    Manter
                  </Button>
                  <Button disabled title="Na demonstração, nada é alterado">
                    Remover
                  </Button>
                </div>
              ) : (
                <Status>{report.status}</Status>
              )}
            </Card>
          );
        })}
      </ul>
    </div>
  );
}

const periods = [
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '12m', label: '12 meses' },
];

export function ReportsScreen({ period }: { period: ReportPeriod }) {
  const rows = exampleChannelReport[period];
  return (
    <div className="flex flex-col gap-8 pt-4 pb-12">
      <TeamHeader title="Relatórios" summary="Aquisição, recebimentos e retenção: Café vs on-line.">
        <LinkTabs
          label="Período"
          current={period}
          items={periods.map((item) => ({
            ...item,
            href: `${teamHref('relatorios')}?periodo=${item.value}`,
          }))}
        />
      </TeamHeader>
      <DataTable
        caption="Por canal de entrada"
        columns={['Canal', 'Novos membros', 'Recebido', 'Retenção']}
        rows={rows.map((row) => [
          <span key="c" className="font-medium">
            {row.channel}
          </span>,
          row.newMembers,
          row.revenue,
          row.retention,
        ])}
      />
      <p className="text-sm text-cf-text-secondary">
        Retenção do Café aparece quando houver participantes que viraram assinantes em mais de um
        ciclo. Exportação em CSV entra com o relatório real (CF-106).
      </p>
    </div>
  );
}
