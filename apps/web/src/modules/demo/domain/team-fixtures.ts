/**
 * Números e listas FICTÍCIOS do painel da equipe na demonstração (CF-176/CF-177). Servem para Ellen e o
 * comercial avaliarem o que o painel mostra e em que ordem; nada aqui é dado real. Os números
 * reais chegam com CF-105/CF-106.
 */

export const exampleKpis = [
  { label: 'Assinaturas ativas', value: '128', delta: '+9 no mês' },
  { label: 'Ingressos vendidos', value: '46', delta: 'Café Curitiba' },
  { label: 'Check-ins realizados', value: '0', delta: 'evento em 06/12' },
  {
    label: 'Recebido no mês',
    value: 'R$ 14.870',
    delta: 'assinaturas + ingressos',
    finance: true,
  },
] as const;

/** Novas assinaturas por mês, para o gráfico de barras com alternativa em tabela. */
export const exampleSignups = [
  { month: 'jun', value: 14 },
  { month: 'jul', value: 19 },
  { month: 'ago', value: 23 },
  { month: 'set', value: 18 },
  { month: 'out', value: 27 },
  { month: 'nov', value: 9 },
] as const;

export const exampleOrders = [
  { id: '#1042', buyer: 'Ana F.', item: 'Ingresso · 2º lote', status: 'Pago', amount: 'R$ 247,00' },
  { id: '#1041', buyer: 'Bruno E.', item: 'Assinatura mensal', status: 'Pago', amount: 'R$ 97,00' },
  {
    id: '#1040',
    buyer: 'Carla T.',
    item: 'Ingresso · 2º lote',
    status: 'Pendente',
    amount: 'R$ 247,00',
  },
  {
    id: '#1039',
    buyer: 'Diego M.',
    item: 'Assinatura mensal',
    status: 'Estornado',
    amount: 'R$ 97,00',
  },
] as const;

export const exampleEvents = [
  {
    id: 'cafe-curitiba',
    title: 'Café Estratégico · Curitiba',
    date: '06/12',
    capacity: 60,
    sold: 46,
    lot: '2º lote · R$ 247',
    status: 'Vendas abertas',
  },
  {
    id: 'cafe-poa',
    title: 'Café Estratégico · Porto Alegre',
    date: '21/02',
    capacity: 50,
    sold: 0,
    lot: '1º lote · R$ 197',
    status: 'Rascunho',
  },
] as const;

export type CheckinResult = 'valido' | 'usado' | 'invalido';

export function parseCheckinResult(value: unknown): CheckinResult | undefined {
  return value === 'valido' || value === 'usado' || value === 'invalido' ? value : undefined;
}

export const checkinFeedback: Record<
  CheckinResult,
  { title: string; detail: string; tone: 'ok' | 'warn' | 'error' }
> = {
  valido: { title: 'Entrada liberada', detail: 'Ana F. · 2º lote', tone: 'ok' },
  usado: { title: 'Ingresso já utilizado', detail: 'Check-in feito às 9h04', tone: 'warn' },
  invalido: {
    title: 'Ingresso inválido',
    detail: 'Código não encontrado ou cancelado',
    tone: 'error',
  },
};

export const exampleContent = [
  { title: 'Comece Aqui', kind: 'Curso', status: 'Publicado', updated: '02/11' },
  { title: 'Primeiros Clientes', kind: 'Curso', status: 'Publicado', updated: '28/10' },
  { title: 'Atendimento e Conversão', kind: 'Curso', status: 'Programado 03/12', updated: '25/10' },
  {
    title: 'Modelo de contrato de honorários',
    kind: 'Material',
    status: 'Publicado',
    updated: '20/10',
  },
] as const;

export const exampleReports = [
  {
    target: 'Publicação em Direito de Família',
    reason: 'Dados de cliente expostos',
    when: 'há 3 horas',
    status: 'Aberta',
  },
  {
    target: 'Comentário em Gestão do escritório',
    reason: 'Propaganda',
    when: 'ontem',
    status: 'Aberta',
  },
  {
    target: 'Publicação em Primeiros anos',
    reason: 'Linguagem ofensiva',
    when: '02/11',
    status: 'Resolvida · removida',
  },
] as const;

export type ReportPeriod = '30d' | '90d' | '12m';

export function parseReportPeriod(value: unknown): ReportPeriod {
  return value === '90d' || value === '12m' ? value : '30d';
}

/** Café vs on-line (CF-106): de onde vem a receita e a retenção, por período. */
export const exampleChannelReport: Record<
  ReportPeriod,
  readonly { channel: string; newMembers: number; revenue: string; retention: string }[]
> = {
  '30d': [
    { channel: 'Café Estratégico', newMembers: 6, revenue: 'R$ 11.362', retention: '—' },
    { channel: 'On-line', newMembers: 9, revenue: 'R$ 3.508', retention: '92%' },
  ],
  '90d': [
    { channel: 'Café Estratégico', newMembers: 15, revenue: 'R$ 24.830', retention: '—' },
    { channel: 'On-line', newMembers: 31, revenue: 'R$ 10.140', retention: '88%' },
  ],
  '12m': [
    { channel: 'Café Estratégico', newMembers: 22, revenue: 'R$ 41.200', retention: '—' },
    { channel: 'On-line', newMembers: 106, revenue: 'R$ 52.900', retention: '84%' },
  ],
};
