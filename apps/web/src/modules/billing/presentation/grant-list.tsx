import type { AccessGrant } from '@caixa-forte/contracts';
import { Button } from '@caixa-forte/ui';

import { GRANT_STATUS_LABELS, grantStatus } from '../domain/grant-status';
import { revokeGrantAction } from './grant-actions';

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** Concessões manuais, mais recentes primeiro; só as ativas podem ser revogadas (CF-048). */
export function GrantList({ grants }: { grants: AccessGrant[] }) {
  if (grants.length === 0) {
    return <p className="text-sm text-cf-text-secondary">Nenhuma concessão manual até agora.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-cf-text-secondary">
          <tr className="border-b border-cf-border">
            <th className="py-3 pe-4 font-medium">Pessoa</th>
            <th className="py-3 pe-4 font-medium">Motivo</th>
            <th className="py-3 pe-4 font-medium">Válido até</th>
            <th className="py-3 pe-4 font-medium">Situação</th>
            <th className="py-3 font-medium">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {grants.map((grant) => {
            const status = grantStatus(grant);
            return (
              <tr key={grant.id} className="border-b border-cf-border last:border-0">
                <td className="py-3 pe-4 text-cf-text">{grant.memberEmail}</td>
                <td className="py-3 pe-4 text-cf-text-secondary">{grant.reason}</td>
                <td className="py-3 pe-4 text-cf-text">{date.format(new Date(grant.validTo))}</td>
                <td className="py-3 pe-4 text-cf-text">{GRANT_STATUS_LABELS[status]}</td>
                <td className="py-3 text-end">
                  {status === 'active' || status === 'scheduled' ? (
                    <form action={revokeGrantAction}>
                      <input type="hidden" name="id" value={grant.id} />
                      <Button type="submit" variant="ghost">
                        Revogar
                      </Button>
                    </form>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
