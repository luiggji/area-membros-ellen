import type { AccessGrant } from '@caixa-forte/contracts';

import { GRANT_STATUS_LABELS, grantStatus, parseTimestamp } from '../domain/grant-status';
import { RevokeGrantButton } from './revoke-grant-button';

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

function rows(grants: AccessGrant[]) {
  return grants.map((grant) => {
    const status = grantStatus(grant);
    return {
      ...grant,
      until: date.format(parseTimestamp(grant.validTo)),
      label: GRANT_STATUS_LABELS[status],
      revocable: status === 'active' || status === 'scheduled',
    };
  });
}

/**
 * Concessões manuais, mais recentes primeiro; só as vigentes podem ser revogadas (CF-048).
 * Tabela a partir de `sm`; no celular, itens empilhados (sem rolagem horizontal, #123).
 */
export function GrantList({ grants }: { grants: AccessGrant[] }) {
  if (grants.length === 0) {
    return <p className="text-sm text-cf-text-secondary">Nenhuma concessão manual até agora.</p>;
  }
  const items = rows(grants);
  return (
    <>
      <ul className="flex flex-col divide-y divide-cf-border sm:hidden">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 py-4 text-sm first:pt-0 last:pb-0">
            <span className="break-all font-medium text-cf-text">{item.memberEmail}</span>
            <span className="text-cf-text-secondary">{item.reason}</span>
            <span className="text-cf-text">
              {item.label} · até {item.until}
            </span>
            {item.revocable ? (
              <div className="self-start">
                <RevokeGrantButton id={item.id} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <table className="hidden w-full text-left text-sm sm:table">
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
          {items.map((item) => (
            <tr key={item.id} className="border-b border-cf-border last:border-0">
              <td className="break-all py-3 pe-4 text-cf-text">{item.memberEmail}</td>
              <td className="py-3 pe-4 text-cf-text-secondary">{item.reason}</td>
              <td className="py-3 pe-4 text-cf-text">{item.until}</td>
              <td className="py-3 pe-4 text-cf-text">{item.label}</td>
              <td className="py-3 text-end">
                {item.revocable ? <RevokeGrantButton id={item.id} /> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
