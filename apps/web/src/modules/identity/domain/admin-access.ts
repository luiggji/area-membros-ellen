import { can, type Role } from '@caixa-forte/contracts';

export type AdminAccess = 'login' | 'not_found' | 'enroll_mfa' | 'verify_mfa' | 'allow';

export interface AdminAccessInput {
  signedIn: boolean;
  roles: readonly Role[];
  /** Nível da sessão atual: `aal2` = segundo fator verificado agora. */
  aal: 'aal1' | 'aal2' | null;
  /** Já existe um fator TOTP verificado na conta. */
  hasVerifiedFactor: boolean;
}

/**
 * Portaria do `/admin` (CF-034). Membro recebe 404: o painel nem "existe" para quem não é da
 * equipe. Toda a equipe (owner, comercial, técnico) precisa de MFA verificado na sessão.
 */
export function adminAccess(input: AdminAccessInput): AdminAccess {
  if (!input.signedIn) return 'login';
  if (!can(input.roles, 'admin.access')) return 'not_found';
  if (input.aal === 'aal2') return 'allow';
  return input.hasVerifiedFactor ? 'verify_mfa' : 'enroll_mfa';
}

/** Código TOTP de 6 dígitos do app autenticador. */
export function isTotpCode(value: unknown): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value);
}
