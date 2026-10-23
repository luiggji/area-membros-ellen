/** Falhas do provedor de identidade traduzidas para o domínio (sem mensagem técnica). */
export type AuthFailure =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'same_password'
  | 'rate_limited'
  | 'session_missing'
  | 'unknown';

/** Porta do Auth (CF-030): a infraestrutura implementa com o Supabase. `null` = sucesso. */
export interface AuthGateway {
  signUp(input: {
    name: string;
    email: string;
    password: string;
    emailRedirectTo: string;
  }): Promise<AuthFailure | null>;
  signIn(input: { email: string; password: string }): Promise<AuthFailure | null>;
  requestPasswordReset(email: string, redirectTo: string): Promise<AuthFailure | null>;
  updatePassword(password: string): Promise<AuthFailure | null>;
  /** Invalida a sessão atual no Auth (refresh token revogado), não só o cookie. */
  signOut(): Promise<void>;
}
