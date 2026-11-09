import {
  DIRECTORY_PAGE_SIZE,
  DirectoryMember,
  DirectoryPage,
  DirectorySearchQuery,
} from '@caixa-forte/contracts';

export interface DirectoryFilters {
  state?: string;
  city?: string;
  area?: string;
  name?: string;
}

/**
 * Porta da busca: devolve só perfis visíveis no diretório (aceite ativo do termo publicado e
 * acesso vigente), na ordem do nome. A regra de quem aparece mora no banco (`search_directory`).
 */
export interface DirectorySearch {
  search(filters: DirectoryFilters, limit: number, offset: number): Promise<DirectoryMember[]>;
}

export const DIRECTORY_SEARCH = Symbol('DIRECTORY_SEARCH');

/** Uma página da busca (CF-091). Pede um perfil a mais só para saber se existe próxima página. */
export async function searchDirectory(
  directory: DirectorySearch,
  query: DirectorySearchQuery,
): Promise<DirectoryPage> {
  const filters: DirectoryFilters = {};
  if (query.uf) filters.state = query.uf;
  if (query.cidade) filters.city = query.cidade;
  if (query.area) filters.area = query.area;
  if (query.nome) filters.name = query.nome;
  const rows = await directory.search(
    filters,
    DIRECTORY_PAGE_SIZE + 1,
    (query.pagina - 1) * DIRECTORY_PAGE_SIZE,
  );
  return {
    members: rows.slice(0, DIRECTORY_PAGE_SIZE),
    page: query.pagina,
    hasMore: rows.length > DIRECTORY_PAGE_SIZE,
  };
}
