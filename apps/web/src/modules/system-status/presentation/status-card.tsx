import { cn } from '@caixa-forte/ui';
import type { ReactNode } from 'react';

export type StatusTone = 'ok' | 'warning' | 'down';

const toneStyles: Record<StatusTone, { dot: string; label: string; text: string }> = {
  ok: { dot: 'bg-success', label: 'Operacional', text: 'text-success' },
  warning: { dot: 'bg-warning', label: 'Atenção', text: 'text-warning' },
  down: { dot: 'bg-danger', label: 'Indisponível', text: 'text-danger' },
};

export function StatusCard({
  title,
  tone,
  summary,
  details,
}: {
  title: string;
  tone: StatusTone;
  summary: string;
  details: ReadonlyArray<[label: string, value: ReactNode]>;
}) {
  const style = toneStyles[tone];
  return (
    <article className="flex flex-col gap-5 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-editorial text-2xl font-semibold text-cf-sidebar">{title}</h2>
          <p className="text-sm text-cf-text-secondary">{summary}</p>
        </div>
        <span className={cn('flex shrink-0 items-center gap-2 text-sm font-medium', style.text)}>
          <span aria-hidden className={cn('size-2.5 rounded-full', style.dot)} />
          {style.label}
        </span>
      </div>
      <dl className="grid gap-x-6 gap-y-3 border-t border-cf-border pt-5 text-sm sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-cf-text-secondary">{label}</dt>
            <dd className="break-all text-cf-text">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
