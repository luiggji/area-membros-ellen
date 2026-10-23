import {
  type FieldErrors,
  fieldErrors,
  newPasswordSchema,
  passwordResetRequestSchema,
  PASSWORD_RULE,
  signInSchema,
  signUpSchema,
} from '../domain/credentials';
import { safeNext } from '../domain/safe-redirect';
import type { AuthFailure, AuthGateway } from './ports';

/** Estado dos formulários (useActionState). `values` devolve o que é seguro reexibir. */
export type FormState =
  | { status: 'idle' }
  | {
      status: 'error';
      message?: string;
      fieldErrors?: FieldErrors;
      values?: Record<string, string>;
    }
  | { status: 'success'; message: string };

export type AuthResult = FormState | { status: 'redirect'; to: string };

export const AUTH_MESSAGES = {
  invalidCredentials: 'E-mail ou senha incorretos.',
  emailNotConfirmed: 'Confirme seu e-mail para entrar. Procure a mensagem que enviamos.',
  weakPassword: `Escolha uma senha mais forte: ${PASSWORD_RULE}`,
  samePassword: 'Escolha uma senha diferente da atual.',
  rateLimited: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  sessionMissing: 'Este link expirou. Peça um novo para redefinir a senha.',
  unknown: 'Não foi possível concluir agora. Tente novamente.',
  resetSent:
    'Se houver uma conta com este e-mail, enviaremos um link para redefinir a senha. Confira também o spam.',
} as const;

const failureMessage: Record<AuthFailure, string> = {
  invalid_credentials: AUTH_MESSAGES.invalidCredentials,
  email_not_confirmed: AUTH_MESSAGES.emailNotConfirmed,
  weak_password: AUTH_MESSAGES.weakPassword,
  same_password: AUTH_MESSAGES.samePassword,
  rate_limited: AUTH_MESSAGES.rateLimited,
  session_missing: AUTH_MESSAGES.sessionMissing,
  unknown: AUTH_MESSAGES.unknown,
};

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** Cadastro: e-mail já usado leva ao mesmo "verifique seu e-mail" (sem enumeração de contas). */
export async function signUp(
  input: Record<string, unknown>,
  auth: AuthGateway,
  appUrl: string,
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  const values = { name: text(input.name), email: text(input.email) };
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrors(parsed.error), values };
  }
  const failure = await auth.signUp({
    ...parsed.data,
    emailRedirectTo: `${appUrl}/auth/callback?next=/app`,
  });
  if (failure === 'weak_password' || failure === 'rate_limited' || failure === 'unknown') {
    return { status: 'error', message: failureMessage[failure], values };
  }
  return { status: 'redirect', to: '/verifique-seu-email' };
}

export async function signIn(
  input: Record<string, unknown>,
  auth: AuthGateway,
): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  const values = { email: text(input.email) };
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrors(parsed.error), values };

  const failure = await auth.signIn(parsed.data);
  if (failure) return { status: 'error', message: failureMessage[failure], values };
  return { status: 'redirect', to: safeNext(text(input.next)) };
}

/** Recuperação: a resposta é sempre a mesma, exista a conta ou não. */
export async function requestPasswordReset(
  input: Record<string, unknown>,
  auth: AuthGateway,
  appUrl: string,
): Promise<AuthResult> {
  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: fieldErrors(parsed.error),
      values: { email: text(input.email) },
    };
  }
  const failure = await auth.requestPasswordReset(
    parsed.data.email,
    `${appUrl}/auth/callback?next=/redefinir-senha`,
  );
  if (failure === 'rate_limited') return { status: 'error', message: AUTH_MESSAGES.rateLimited };
  return { status: 'success', message: AUTH_MESSAGES.resetSent };
}

export async function updatePassword(
  input: Record<string, unknown>,
  auth: AuthGateway,
): Promise<AuthResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrors(parsed.error) };

  const failure = await auth.updatePassword(parsed.data.password);
  if (failure) return { status: 'error', message: failureMessage[failure] };
  return { status: 'redirect', to: '/app' };
}

export async function signOut(auth: AuthGateway): Promise<AuthResult> {
  await auth.signOut();
  return { status: 'redirect', to: '/entrar?saiu=1' };
}
