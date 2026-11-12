import { Feed, MemberGroup } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { CommunityStore, FEED_SIZE, MembershipWrite } from '../application/membership';

export class SupabaseCommunityStore implements CommunityStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async listGroups(userId: string): Promise<MemberGroup[]> {
    const { data, error } = await this.client.rpc('member_groups', { p_user: userId });
    if (error) throw new Error(`member_groups: falha (${error.code})`);
    return (data ?? []).map((group) => ({
      id: group.id,
      slug: group.slug,
      name: group.name,
      description: group.description,
      memberCount: Number(group.member_count),
      joined: group.joined,
    }));
  }

  /** Só entra em grupo publicado; repetir não é erro (a chave primária absorve). */
  async join(groupId: string, userId: string): Promise<MembershipWrite> {
    if (!(await this.isPublished(groupId))) return 'not_found';
    const { error } = await this.client
      .from('group_members')
      .upsert({ group_id: groupId, user_id: userId }, { onConflict: 'group_id,user_id' });
    if (error) throw new Error(`group_members: falha ao entrar (${error.code})`);
    return 'ok';
  }

  /** Sair de grupo em que não se está não é erro: o estado final é o pedido. */
  async leave(groupId: string, userId: string): Promise<MembershipWrite> {
    if (!(await this.isPublished(groupId))) return 'not_found';
    const { error } = await this.client
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw new Error(`group_members: falha ao sair (${error.code})`);
    return 'ok';
  }

  async feed(userId: string): Promise<Feed> {
    const { data, error } = await this.client.rpc('member_feed', {
      p_user: userId,
      p_limit: FEED_SIZE,
    });
    if (error) throw new Error(`member_feed: falha (${error.code})`);
    return {
      posts: (data ?? []).map((post) => ({
        id: post.id,
        body: post.body,
        createdAt: post.created_at,
        authorName: post.author_name,
        group: { slug: post.group_slug, name: post.group_name },
      })),
      joinedAnyGroup: await this.joinedAnyGroup(userId),
    };
  }

  /**
   * "Não entrou em nenhum grupo" e "entrou, mas ninguém publicou" são estados vazios diferentes,
   * e a tela diz coisas diferentes em cada um.
   */
  private async joinedAnyGroup(userId: string): Promise<boolean> {
    const { count, error } = await this.client
      .from('group_members')
      .select('group_id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw new Error(`group_members: falha ao contar (${error.code})`);
    return (count ?? 0) > 0;
  }

  /** Grupo em rascunho ou oculto não existe para o membro, nem para entrar nem para sair. */
  private async isPublished(groupId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw new Error(`groups: falha ao conferir (${error.code})`);
    return data !== null;
  }
}

/** Dev sem Supabase: comunidade vazia; escrever falha alto em vez de fingir sucesso. */
export class UnconfiguredCommunityStore implements CommunityStore {
  async listGroups(): Promise<MemberGroup[]> {
    return [];
  }

  async feed(): Promise<Feed> {
    return { posts: [], joinedAnyGroup: false };
  }

  private fail(): never {
    throw new Error('Supabase não configurado: comunidade indisponível');
  }

  async join(): Promise<MembershipWrite> {
    this.fail();
  }

  async leave(): Promise<MembershipWrite> {
    this.fail();
  }
}
