import { parseTimestamp } from './timestamp';

export { parseTimestamp };

/** Situação de uma concessão manual na lista do owner (CF-048). */
export type GrantStatus = 'active' | 'revoked' | 'expired' | 'scheduled';

export const GRANT_STATUS_LABELS: Record<GrantStatus, string> = {
  active: 'Ativa',
  revoked: 'Revogada',
  expired: 'Expirada',
  scheduled: 'Programada',
};

/**
 * Margem para diferença de relógio entre o servidor web e o banco (`valid_from = now()` no
 * banco): uma concessão recém-criada não pode aparecer como "Programada" (#123).
 */
const CLOCK_TOLERANCE_MS = 5 * 60 * 1000;

export function grantStatus(
  grant: { validFrom: string; validTo: string; revokedAt: string | null },
  now: Date = new Date(),
): GrantStatus {
  if (grant.revokedAt) return 'revoked';
  if (parseTimestamp(grant.validTo) <= now) return 'expired';
  if (parseTimestamp(grant.validFrom).getTime() > now.getTime() + CLOCK_TOLERANCE_MS) {
    return 'scheduled';
  }
  return 'active';
}

/** Hoje no horário de Brasília (`aaaa-mm-dd`), para o mínimo do campo de data. */
export function todayInBrasilia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}
