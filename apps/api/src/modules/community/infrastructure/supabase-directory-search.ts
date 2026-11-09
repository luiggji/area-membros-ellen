import { DirectoryMember } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { DirectoryFilters, DirectorySearch } from '../application/directory-search';

/**
 * Busca pela função `search_directory` (só a chave de serviço executa): o filtro de quem aparece
 * (aceite ativo e acesso vigente) e o teto da página ficam no banco.
 */
export class SupabaseDirectorySearch implements DirectorySearch {
  constructor(private readonly client: SupabaseAdmin) {}

  async search(
    filters: DirectoryFilters,
    limit: number,
    offset: number,
  ): Promise<DirectoryMember[]> {
    const { data, error } = await this.client.rpc('search_directory', {
      ...(filters.state ? { p_state: filters.state } : {}),
      ...(filters.city ? { p_city: filters.city } : {}),
      ...(filters.area ? { p_area: filters.area } : {}),
      ...(filters.name ? { p_name: filters.name } : {}),
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw new Error(`diretório: falha na busca (${error.code})`);
    return data.map((row) => ({
      id: row.user_id,
      displayName: row.display_name,
      city: row.city ?? null,
      state: row.state ?? null,
      areas: row.areas ?? [],
      bio: row.bio ?? null,
      links: row.links ?? [],
    }));
  }
}

/** Dev sem Supabase (CF-012): diretório vazio. */
export class UnconfiguredDirectorySearch implements DirectorySearch {
  async search(): Promise<DirectoryMember[]> {
    return [];
  }
}
