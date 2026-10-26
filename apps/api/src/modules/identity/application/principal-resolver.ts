import { Inject, Injectable } from '@nestjs/common';

import {
  ACCESS_TOKEN_VERIFIER,
  AccessTokenVerifier,
  Principal,
  ROLE_REPOSITORY,
  RoleRepository,
} from './ports';

/** Token → usuário verificado no Auth → papéis atuais no banco (nunca papéis vindos do cliente). */
@Injectable()
export class PrincipalResolver {
  constructor(
    @Inject(ACCESS_TOKEN_VERIFIER) private readonly verifier: AccessTokenVerifier,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async resolve(token: string | undefined): Promise<Principal | null> {
    if (!token) return null;
    const verified = await this.verifier.verify(token);
    if (!verified) return null;
    return { ...verified, roles: await this.roles.rolesOf(verified.userId) };
  }
}
