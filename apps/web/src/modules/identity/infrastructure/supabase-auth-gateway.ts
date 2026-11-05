import type { SupabaseClient } from '@supabase/supabase-js';

import type { AuthFailure, AuthGateway } from '../application/ports';

/** Formato mínimo do erro do Supabase Auth que interessa aqui (código e status HTTP). */
interface AuthErrorLike {
  code?: string;
  status?: number;
}

/** Traduz o erro do Supabase Auth; o texto original (que pode citar o e-mail) nunca sai daqui. */
export function toAuthFailure(error: AuthErrorLike | null): AuthFailure | null {
  if (!error) return null;
  if (error.status === 429 || error.code?.startsWith('over_')) return 'rate_limited';
  switch (error.code) {
    case 'invalid_credentials':
      return 'invalid_credentials';
    case 'email_not_confirmed':
      return 'email_not_confirmed';
    case 'weak_password':
      return 'weak_password';
    case 'same_password':
      return 'same_password';
    case 'session_not_found':
    case 'session_expired':
    case 'refresh_token_not_found':
      return 'session_missing';
    // E-mail já cadastrado: tratado como sucesso no cadastro (sem enumeração de contas).
    case 'user_already_exists':
    case 'email_exists':
      return null;
    default:
      return error.status === 401 || error.status === 403 ? 'session_missing' : 'unknown';
  }
}

/** Adapter do Supabase Auth: cliente de servidor com a chave pública (sessão em cookies). */
export function supabaseAuthGateway(client: SupabaseClient): AuthGateway {
  return {
    async signUp({ name, email, password, emailRedirectTo }) {
      const { error } = await client.auth.signUp({
        email,
        password,
        // O nome vai para user_metadata; perfil e consentimentos são do CF-031.
        options: { emailRedirectTo, data: { name } },
      });
      return toAuthFailure(error);
    },
    async signIn({ email, password }) {
      const { error } = await client.auth.signInWithPassword({ email, password });
      return toAuthFailure(error);
    },
    async requestPasswordReset(email, redirectTo) {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      return toAuthFailure(error);
    },
    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      return toAuthFailure(error);
    },
    async signOut() {
      // `local`: revoga a sessão deste dispositivo no Auth, além de apagar os cookies.
      await client.auth.signOut({ scope: 'local' });
    },
  };
}
