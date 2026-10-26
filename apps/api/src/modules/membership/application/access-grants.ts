import { AccessGrant, GrantAccessRequest } from '@caixa-forte/contracts';

/** Persistência das concessões manuais; a trilha de auditoria é trigger no banco (CF-048). */
export interface GrantStore {
  userIdByEmail(email: string): Promise<string | null>;
  create(input: {
    userId: string;
    reason: string;
    validTo: string;
    grantedBy: string;
  }): Promise<string>;
  /** Revoga se existir, for manual e ainda estiver ativa; `false` caso contrário. */
  revoke(id: string, revokedBy: string): Promise<boolean>;
  list(): Promise<AccessGrant[]>;
}

export const GRANT_STORE = Symbol('GRANT_STORE');

export type GrantResult =
  { status: 'created'; id: string } | { status: 'member_not_found' } | { status: 'invalid_date' };

/** Último instante do dia de validade no horário de Brasília (UTC-3, sem horário de verão). */
export function endOfDayInBrasilia(date: string): Date {
  return new Date(`${date}T23:59:59.999-03:00`);
}

/** Concede acesso pago manual: validade obrigatória e no futuro; motivo já validado no contrato. */
export async function grantAccess(
  store: GrantStore,
  request: GrantAccessRequest,
  grantedBy: string,
  now: Date = new Date(),
): Promise<GrantResult> {
  const validTo = endOfDayInBrasilia(request.validUntil);
  if (Number.isNaN(validTo.getTime()) || validTo <= now) return { status: 'invalid_date' };
  const userId = await store.userIdByEmail(request.email);
  if (!userId) return { status: 'member_not_found' };
  const id = await store.create({
    userId,
    reason: request.reason,
    validTo: validTo.toISOString(),
    grantedBy,
  });
  return { status: 'created', id };
}
