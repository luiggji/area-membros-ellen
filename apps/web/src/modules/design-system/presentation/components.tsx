import { AlertTriangle, ArrowRight, Inbox, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Padrões de componente propostos para a v1.1. São amostras visuais para homologação: os
 * componentes reutilizáveis de verdade nascem em `packages/ui` com CF-020/CF-022 e os estados de
 * tela com CF-157.
 */

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="text-xs text-cf-text-secondary">{label}</span>
    </div>
  );
}

export function ButtonsSample() {
  return (
    <div className="flex flex-wrap items-start gap-8 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
      <Labeled label="Primário · uma ação principal por seção">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cf-primary px-7 text-sm font-medium text-cf-surface hover:bg-cf-sidebar"
        >
          Continuar <ArrowRight aria-hidden className="size-4" />
        </button>
      </Labeled>
      <Labeled label="Secundário · contorno">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-full border border-cf-primary px-6 text-sm font-medium text-cf-primary hover:bg-cf-surface-muted"
        >
          Ver detalhes
        </button>
      </Labeled>
      <Labeled label="Link de navegação">
        <a
          href="#botoes"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-cf-primary hover:text-cf-sidebar"
        >
          Ver todos <ArrowRight aria-hidden className="size-4" />
        </a>
      </Labeled>
      <Labeled label="Desabilitado · sempre com motivo visível">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled
            aria-describedby="motivo-desabilitado"
            className="inline-flex min-h-11 items-center rounded-full bg-cf-surface-muted px-7 text-sm font-medium text-cf-text-secondary disabled:cursor-not-allowed"
          >
            Quero participar
          </button>
          <span id="motivo-desabilitado" className="text-xs text-cf-text-secondary">
            Vagas esgotadas
          </span>
        </div>
      </Labeled>
      <Labeled label="Foco por teclado (Tab)">
        <span className="inline-flex min-h-11 items-center rounded-full bg-cf-primary px-7 text-sm font-medium text-cf-surface outline-2 outline-offset-2 outline-cf-focus">
          Foco visível
        </span>
      </Labeled>
    </div>
  );
}

export function CardsSample() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <article className="flex flex-col gap-2 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6">
        <span className="text-xs text-cf-text-secondary">cf-surface + borda</span>
        <h3 className="font-editorial text-xl font-semibold text-cf-sidebar">Card de leitura</h3>
        <p className="text-sm text-cf-text-secondary">
          Cursos, posts e listas. Borda fina, sem sombra.
        </p>
      </article>
      <article className="flex flex-col gap-2 rounded-(--radius-card) border border-cf-border bg-cf-surface-muted p-6">
        <span className="text-xs text-cf-text-secondary">cf-surface-muted</span>
        <h3 className="font-editorial text-xl font-semibold text-cf-sidebar">Card de destaque</h3>
        <p className="text-sm text-cf-text-secondary">Jornada e cards auxiliares da home.</p>
      </article>
      <article className="flex flex-col gap-2 rounded-(--radius-card) bg-cf-sidebar p-6 text-cream-50">
        <span className="text-xs text-cream-50/70">cf-sidebar · uso raro</span>
        <h3 className="font-editorial text-xl font-semibold">Superfície profunda</h3>
        <p className="text-sm text-cream-50/80">
          Só sidebar e pontos de marca — nunca a tela inteira.
        </p>
      </article>
    </div>
  );
}

function StatePanel({
  icon,
  title,
  text,
  action,
  tone = 'neutral',
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: string;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 text-center">
      <span
        aria-hidden
        className={
          tone === 'danger'
            ? 'grid size-12 place-items-center rounded-full bg-danger/10 text-danger'
            : 'grid size-12 place-items-center rounded-full bg-blush-200 text-cf-primary'
        }
      >
        {icon}
      </span>
      <h3 className="font-medium text-cf-text">{title}</h3>
      <p className="text-sm text-cf-text-secondary">{text}</p>
      {action && (
        <span className="inline-flex min-h-11 items-center rounded-full border border-cf-primary px-5 text-sm font-medium text-cf-primary">
          {action}
        </span>
      )}
    </div>
  );
}

export function StatesSample() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        aria-hidden
        className="flex flex-col gap-3 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6"
      >
        <span className="text-xs text-cf-text-secondary">Carregando</span>
        <div className="h-24 animate-pulse rounded-xl bg-cf-surface-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-cf-surface-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-cf-surface-muted" />
      </div>
      <StatePanel
        icon={<Inbox className="size-5" />}
        title="Nada por aqui ainda"
        text="Mensagem verdadeira sobre o vazio, nunca conteúdo inventado."
        action="Explorar cursos"
      />
      <StatePanel
        icon={<AlertTriangle className="size-5" />}
        title="Não foi possível carregar"
        text="Explica o erro em linguagem simples e oferece tentar de novo."
        action="Tentar novamente"
        tone="danger"
      />
      <StatePanel
        icon={<Lock className="size-5" />}
        title="Conteúdo para assinantes"
        text="Sem permissão: diz o motivo e o caminho, sem expor o conteúdo."
        action="Ver planos"
      />
    </div>
  );
}
