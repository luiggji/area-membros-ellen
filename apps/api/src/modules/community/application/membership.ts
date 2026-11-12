import { Feed, MemberGroup } from '@caixa-forte/contracts';

/** Entrar ou sair de um grupo. `not_found`: o grupo não existe ou não está publicado. */
export type MembershipWrite = 'ok' | 'not_found';

/**
 * Comunidade na visão de quem participa (CF-093). Quem administra os grupos é o owner, por
 * outra porta (`GroupStore`, CF-092). Entrar e sair são idempotentes: repetir não é erro.
 */
export interface CommunityStore {
  /** Grupos publicados, com quantos participam e se esta pessoa participa. */
  listGroups(userId: string): Promise<MemberGroup[]>;
  join(groupId: string, userId: string): Promise<MembershipWrite>;
  leave(groupId: string, userId: string): Promise<MembershipWrite>;
  /** Publicações dos grupos em que a pessoa entrou, mais recentes primeiro. */
  feed(userId: string): Promise<Feed>;
}

export const COMMUNITY_STORE = Symbol('COMMUNITY_STORE');

/** Quantas publicações o feed traz de uma vez. Sem paginação no MVP (CF-093). */
export const FEED_SIZE = 30;
