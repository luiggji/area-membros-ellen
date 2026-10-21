import { buttonClasses } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  type ApiHealth,
  checkApiHealth,
} from '@/modules/system-status/application/check-api-health';
import {
  type SupabaseHealth,
  checkSupabaseHealth,
} from '@/modules/system-status/application/check-supabase-health';
import { StatusCard, type StatusTone } from '@/modules/system-status/presentation/status-card';
import { publicEnv } from '@/shared/config/env';
import { type EnvironmentStatus, environmentStatus } from '@/shared/config/environment';
import { supabasePublicConfig } from '@/shared/lib/supabase/config';
import { PreviewHeader } from '@/shared/ui/preview-header';

export const metadata: Metadata = { title: 'Status · Caixa Forte' };

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'America/Sao_Paulo',
});

function apiCard(health: ApiHealth): {
  tone: StatusTone;
  summary: string;
  details: [string, string][];
} {
  const endpoint: [string, string] = ['Endpoint', `${publicEnv.NEXT_PUBLIC_API_URL}/health`];
  switch (health.state) {
    case 'ok':
    case 'degraded':
      return {
        tone: health.state === 'ok' ? 'ok' : 'warning',
        summary:
          health.state === 'ok'
            ? 'Respondeu dentro do contrato HealthResponse.'
            : 'Respondeu, mas informou dependência degradada.',
        details: [
          endpoint,
          ['Serviço', `${health.report.service} v${health.report.version}`],
          ['Latência', `${health.latencyMs} ms`],
          ['Verificado pela API em', dateTime.format(new Date(health.report.timestamp))],
        ],
      };
    case 'invalid':
      return {
        tone: 'warning',
        summary: `Respondeu de forma inesperada: ${health.detail}.`,
        details: [endpoint, ['Latência', `${health.latencyMs} ms`]],
      };
    case 'down':
      return {
        tone: 'down',
        summary: `${health.detail}. Em dev, suba a API com pnpm dev.`,
        details: [endpoint],
      };
  }
}

const envLabels = { development: 'Desenvolvimento', staging: 'Staging', production: 'Produção' };

function environmentCard({ appEnv, isolation }: EnvironmentStatus): {
  tone: StatusTone;
  summary: string;
  details: [string, string][];
} {
  const ambiente: [string, string] = ['Ambiente (APP_ENV)', envLabels[appEnv]];
  switch (isolation.status) {
    case 'not-configured':
      return {
        tone: 'warning',
        summary: 'Banco ainda não provisionado: hospedagem e Supabase aguardam a decisão P-014.',
        details: [ambiente, ['Supabase', 'não configurado'], ['Regra', 'dev pode rodar sem banco']],
      };
    case 'violation':
      return {
        tone: 'down',
        summary: `Configuração bloqueada: ${isolation.reason}.`,
        details: [ambiente],
      };
    case 'ok':
      return {
        tone: 'ok',
        summary: 'Banco próprio deste ambiente, isolado de produção.',
        details: [ambiente, ['Projeto Supabase', isolation.projectRef]],
      };
  }
}

function supabaseCard(health: SupabaseHealth | null): {
  tone: StatusTone;
  summary: string;
  details: [string, string][];
} {
  const cliente: [string, string][] = [
    ['Cliente', '@supabase/ssr tipado'],
    ['Chave', 'pública, sob RLS'],
  ];
  if (!health) {
    return {
      tone: 'warning',
      summary: 'Sem URL ou chave pública do Supabase neste ambiente.',
      details: [...cliente, ['Configurar', 'NEXT_PUBLIC_SUPABASE_URL e _ANON_KEY']],
    };
  }
  switch (health.state) {
    case 'ok':
      return {
        tone: 'ok',
        summary: 'Conectado: o Auth respondeu com a chave pública deste ambiente.',
        details: [
          ...cliente,
          ['Latência', `${health.latencyMs} ms`],
          ['Versão do Auth', health.authVersion ?? '—'],
        ],
      };
    case 'invalid':
      return {
        tone: 'warning',
        summary: `Respondeu com problema: ${health.detail}.`,
        details: [...cliente, ['Latência', `${health.latencyMs} ms`]],
      };
    case 'down':
      return { tone: 'down', summary: `${health.detail}.`, details: cliente };
  }
}

/** Saúde de web e API (CF-170), consultada no servidor a cada acesso. */
export default async function StatusPage() {
  const supabaseConfig = supabasePublicConfig(publicEnv);
  const [apiHealth, supabaseHealth] = await Promise.all([
    checkApiHealth(publicEnv.NEXT_PUBLIC_API_URL),
    supabaseConfig ? checkSupabaseHealth(supabaseConfig) : null,
  ]);
  const api = apiCard(apiHealth);
  const supabase = supabaseCard(supabaseHealth);
  const environment = environmentCard(environmentStatus(process.env));

  return (
    <>
      <PreviewHeader active="/status" />
      <main className="mx-auto flex max-w-(--spacing-content-max) flex-col gap-8 px-4 py-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase">
              Status do sistema
            </p>
            <h1 className="font-editorial tracking-tight text-5xl text-cf-sidebar">Tudo no ar?</h1>
          </div>
          <Link href="/status" className={buttonClasses({ variant: 'secondary' })}>
            Verificar de novo
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <StatusCard
            title="Web (Next.js)"
            tone="ok"
            summary="Esta página foi renderizada pelo servidor web."
            details={[
              ['Build (NODE_ENV)', process.env.NODE_ENV ?? '—'],
              ['Renderizada em', dateTime.format(new Date())],
              ['Rotas internas', '/prototipo, /design, /status'],
              ['URL pública', publicEnv.NEXT_PUBLIC_APP_URL],
            ]}
          />
          <StatusCard title="API (NestJS)" {...api} />
          <StatusCard title="Ambiente e banco (CF-012)" {...environment} />
          <StatusCard title="Supabase (CF-156)" {...supabase} />
        </div>

        <p className="text-xs text-cf-text-secondary">
          E-mail e pagamentos entram aqui quando forem conectados (CF-100, CF-043). Sem dados
          pessoais nem chaves nesta página.
        </p>
      </main>
    </>
  );
}
