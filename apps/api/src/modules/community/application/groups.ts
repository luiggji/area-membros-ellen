import { AdminGroup, CreateGroupRequest, UpdateGroupRequest } from '@caixa-forte/contracts';

/** Resultado de escrita no catálogo de grupos; a trilha de auditoria é gravada junto, no banco. */
export type GroupWrite =
  { status: 'ok'; id: string } | { status: 'not_found' } | { status: 'duplicate' };

/** Catálogo de grupos temáticos (`save_group` no banco), administrado pelo owner (CF-092). */
export interface GroupStore {
  /** Todos os grupos, inclusive rascunhos e ocultos: é a visão da administração. */
  list(): Promise<AdminGroup[]>;
  create(input: CreateGroupRequest, actorId: string): Promise<GroupWrite>;
  update(id: string, input: UpdateGroupRequest, actorId: string): Promise<GroupWrite>;
}

export const GROUP_STORE = Symbol('GROUP_STORE');
