import { Role } from '@caixa-forte/contracts';

/**
 * Nível de autenticação da sessão (claim `aal` do Supabase Auth): `aal2` = segundo fator (MFA)
 * verificado nesta sessão. Exigido para qualquer permissão administrativa (CF-034).
 */
export type AssuranceLevel = 'aal1' | 'aal2';

export interface VerifiedToken {
  userId: string;
  aal: AssuranceLevel;
}

/** Verifica o access token do Supabase Auth; `null` se inválido, expirado ou de sessão encerrada. */
export interface AccessTokenVerifier {
  verify(token: string): Promise<VerifiedToken | null>;
}

/** Papéis do usuário (`user_roles`, CF-032). */
export interface RoleRepository {
  rolesOf(userId: string): Promise<Role[]>;
}

export const ACCESS_TOKEN_VERIFIER = Symbol('ACCESS_TOKEN_VERIFIER');
export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

/** Quem está chamando, resolvido no servidor a cada requisição. */
export interface Principal {
  userId: string;
  roles: Role[];
  aal: AssuranceLevel;
}
