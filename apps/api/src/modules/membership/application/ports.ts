/** Escopos de acesso pago; o MVP tem um só (Seven Box nunca incluso). */
export type AccessScope = 'caixa_forte';

/** Acesso vigente, decidido no banco por `private.access_of` (CF-046). */
export interface MemberAccess {
  source: 'subscription' | 'manual';
  /** Estado do contrato quando o acesso vem de assinatura. */
  subscriptionStatus: string | null;
  /** Até quando vale (fim do período pago ou da concessão); `null` = sem fim conhecido. */
  validUntil: string | null;
}

/** Lê o acesso de uma pessoa; `null` = sem acesso. */
export interface AccessReader {
  accessOf(userId: string, scope: AccessScope): Promise<MemberAccess | null>;
}

export const ACCESS_READER = Symbol('ACCESS_READER');
