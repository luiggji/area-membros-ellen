import { Role } from '@caixa-forte/contracts';

/** Verifica o access token do Supabase Auth e devolve o id do usuário, ou `null` se inválido. */
export interface AccessTokenVerifier {
  verify(token: string): Promise<string | null>;
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
}
