import type { Metadata } from 'next';
import Link from 'next/link';

import {
  type ApiHealth,
  checkApiHealth,
} from '@/modules/system-status/application/check-api-health';
import { StatusCard, type StatusTone } from '@/modules/system-status/presentation/status-card';
import { publicEnv } from '@/shared/config/env';
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

/** Saúde de web e API (CF-170), consultada no servidor a cada acesso. */
export default async function StatusPage() {
  const api = apiCard(await checkApiHealth(publicEnv.NEXT_PUBLIC_API_URL));

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
          <Link
            href="/status"
            className="inline-flex min-h-11 items-center rounded-full border border-cf-primary px-6 text-sm font-medium text-cf-primary hover:bg-cf-surface-muted"
          >
            Verificar de novo
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <StatusCard
            title="Web (Next.js)"
            tone="ok"
            summary="Esta página foi renderizada pelo servidor web."
            details={[
              ['Ambiente', process.env.NODE_ENV ?? '—'],
              ['Renderizada em', dateTime.format(new Date())],
              ['Rotas internas', '/prototipo, /design, /status'],
              ['URL pública', publicEnv.NEXT_PUBLIC_APP_URL],
            ]}
          />
          <StatusCard title="API (NestJS)" {...api} />
        </div>

        <p className="text-xs text-cf-text-secondary">
          Banco (Supabase), e-mail e pagamentos entram aqui quando forem conectados (CF-012, CF-100,
          CF-043). Sem dados pessoais nesta página.
        </p>
      </main>
    </>
  );
}
