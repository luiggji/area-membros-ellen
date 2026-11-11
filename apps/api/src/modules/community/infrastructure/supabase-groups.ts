import {
  AdminGroup,
  CreateGroupRequest,
  GroupStatus,
  UpdateGroupRequest,
} from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { GroupStore, GroupWrite } from '../application/groups';

/** Erros do banco que viram resposta de negócio; o resto falha alto (500). */
function toWrite(data: string | null, error: { code?: string } | null, what: string): GroupWrite {
  if (error?.code === '23505') return { status: 'duplicate' };
  if (error?.code === 'P0002') return { status: 'not_found' };
  if (error || !data) throw new Error(`${what}: falha (${error?.code ?? 'sem retorno'})`);
  return { status: 'ok', id: data };
}

export class SupabaseGroupStore implements GroupStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async list(): Promise<AdminGroup[]> {
    const { data, error } = await this.client
      .from('groups')
      .select('id, slug, name, description, status, created_at')
      .order('name');
    if (error) throw new Error(`groups: falha ao listar (${error.code})`);
    return data.map((group) => ({
      id: group.id,
      slug: group.slug,
      name: group.name,
      description: group.description,
      status: group.status as GroupStatus,
      createdAt: group.created_at,
    }));
  }

  /** Grupo nasce em rascunho: criar não publica. */
  async create(input: CreateGroupRequest, actorId: string): Promise<GroupWrite> {
    const { data, error } = await this.client.rpc('save_group', {
      p_slug: input.slug,
      p_name: input.name,
      p_description: input.description,
      p_status: 'draft',
      p_actor: actorId,
    });
    return toWrite(data, error, 'save_group');
  }

  /** O slug não muda depois de criado; a função ignora `p_slug` quando há `p_id`. */
  async update(id: string, input: UpdateGroupRequest, actorId: string): Promise<GroupWrite> {
    const { data, error } = await this.client.rpc('save_group', {
      p_id: id,
      p_slug: '',
      p_name: input.name,
      p_description: input.description,
      p_status: input.status,
      p_actor: actorId,
    });
    return toWrite(data, error, 'save_group');
  }
}

/** Dev sem Supabase: catálogo vazio; escrever falha alto em vez de fingir sucesso. */
export class UnconfiguredGroupStore implements GroupStore {
  async list(): Promise<AdminGroup[]> {
    return [];
  }

  private fail(): never {
    throw new Error('Supabase não configurado: catálogo de grupos indisponível');
  }

  async create(): Promise<GroupWrite> {
    this.fail();
  }

  async update(): Promise<GroupWrite> {
    this.fail();
  }
}
