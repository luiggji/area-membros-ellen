import { DIRECTORY_PAGE_SIZE, DirectoryMember } from '@caixa-forte/contracts';
import { describe, expect, it, jest } from '@jest/globals';

import { DirectorySearch, searchDirectory } from './directory-search';

const member = (n: number): DirectoryMember => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  displayName: `Pessoa fictícia ${n}`,
  city: 'Curitiba',
  state: 'PR',
  areas: ['Família'],
  bio: null,
  links: [],
});

const directoryWith = (count: number) => ({
  search: jest.fn<DirectorySearch['search']>(async (_filters, limit) =>
    Array.from({ length: Math.min(count, limit) }, (_, i) => member(i)),
  ),
});

describe('busca no diretório', () => {
  it('traduz os filtros, calcula o deslocamento e diz se há próxima página', async () => {
    const directory = directoryWith(DIRECTORY_PAGE_SIZE + 5);
    const page = await searchDirectory(directory, { uf: 'PR', area: 'Família', pagina: 3 });
    expect(directory.search).toHaveBeenCalledWith(
      { state: 'PR', area: 'Família' },
      DIRECTORY_PAGE_SIZE + 1,
      2 * DIRECTORY_PAGE_SIZE,
    );
    expect(page.members).toHaveLength(DIRECTORY_PAGE_SIZE);
    expect(page).toMatchObject({ page: 3, hasMore: true });
  });

  it('última página e busca vazia: sem próxima', async () => {
    expect(await searchDirectory(directoryWith(2), { pagina: 1 })).toMatchObject({
      page: 1,
      hasMore: false,
    });
    expect(await searchDirectory(directoryWith(0), { cidade: 'Nenhures', pagina: 1 })).toEqual({
      members: [],
      page: 1,
      hasMore: false,
    });
  });
});
