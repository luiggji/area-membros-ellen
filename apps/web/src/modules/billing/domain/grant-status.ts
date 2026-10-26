/** Situação de uma concessão manual na lista do owner (CF-048). */
export type GrantStatus = 'active' | 'revoked' | 'expired' | 'scheduled';

export const GRANT_STATUS_LABELS: Record<GrantStatus, string> = {
  active: 'Ativa',
  revoked: 'Revogada',
  expired: 'Expirada',
  scheduled: 'Programada',
};

export function grantStatus(
  grant: { validFrom: string; validTo: string; revokedAt: string | null },
  now: Date = new Date(),
): GrantStatus {
  if (grant.revokedAt) return 'revoked';
  if (new Date(grant.validTo) <= now) return 'expired';
  if (new Date(grant.validFrom) > now) return 'scheduled';
  return 'active';
}

/** Hoje no horário de Brasília (`aaaa-mm-dd`), para o mínimo do campo de data. */
export function todayInBrasilia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}
