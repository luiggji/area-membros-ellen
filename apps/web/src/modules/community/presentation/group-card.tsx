import { type AdminGroup, GROUP_STATUSES } from '@caixa-forte/contracts';

import { parseTimestamp } from '../domain/timestamp';
import { EditGroupForm } from './group-forms';

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** Um grupo temático, com o formulário que publica ou oculta (CF-092). */
export function GroupCard({ group }: { group: AdminGroup }) {
  return (
    <article className="flex flex-col gap-6 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-editorial text-2xl tracking-tight text-cf-text">{group.name}</h3>
        <span className="text-sm text-cf-text-secondary">
          {group.slug} · {GROUP_STATUSES[group.status].toLowerCase()} · criado em{' '}
          {date.format(parseTimestamp(group.createdAt))}
        </span>
      </header>

      {group.description ? (
        <p className="text-cf-text-secondary">{group.description}</p>
      ) : (
        <p className="text-sm text-cf-text-secondary">Sem descrição.</p>
      )}

      <details className="group">
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-cf-primary">
          Editar, publicar ou ocultar
        </summary>
        <div className="pt-4">
          <EditGroupForm group={group} />
        </div>
      </details>
    </article>
  );
}
