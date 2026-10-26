import { isTotpCode } from '../domain/admin-access';

/** Porta do segundo fator (CF-034); a infraestrutura implementa com `supabase.auth.mfa`. */
export interface MfaGateway {
  /** Remove cadastros TOTP abandonados no meio (não verificados) antes de começar outro. */
  removePendingTotp(): Promise<void>;
  enrollTotp(): Promise<{ factorId: string; qrCode: string; secret: string } | null>;
  /** Desafia e verifica o código; sucesso eleva a sessão para `aal2`. */
  verify(factorId: string, code: string): Promise<boolean>;
}

export type MfaState =
  | { status: 'idle'; message?: string }
  | { status: 'enrolling'; factorId: string; qrCode: string; secret: string; message?: string }
  | { status: 'error'; message: string }
  | { status: 'redirect'; to: string };

export const MFA_MESSAGES = {
  invalidCode: 'Código inválido ou expirado. Confira o app autenticador e tente de novo.',
  enrollFailed: 'Não foi possível gerar o QR code agora. Tente novamente.',
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function startEnrollment(mfa: MfaGateway): Promise<MfaState> {
  await mfa.removePendingTotp();
  const enrolled = await mfa.enrollTotp();
  if (!enrolled) return { status: 'error', message: MFA_MESSAGES.enrollFailed };
  return { status: 'enrolling', ...enrolled };
}

/**
 * Confirma o código (no cadastro ou no login da equipe). Só recebe fator e código: o QR e a chave
 * ficam no navegador e não voltam ao servidor.
 */
export async function confirmCode(
  input: { factorId?: unknown; code?: unknown },
  mfa: MfaGateway,
): Promise<MfaState> {
  const code = typeof input.code === 'string' ? input.code.replace(/\s/g, '') : input.code;
  if (
    typeof input.factorId !== 'string' ||
    !UUID.test(input.factorId) ||
    !isTotpCode(code) ||
    !(await mfa.verify(input.factorId, code))
  ) {
    return { status: 'error', message: MFA_MESSAGES.invalidCode };
  }
  return { status: 'redirect', to: '/admin' };
}
