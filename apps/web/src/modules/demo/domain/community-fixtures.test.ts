import { describe, expect, it } from 'vitest';

import { exampleMembers, findMember, searchMembers } from './community-fixtures';

describe('demonstração — comunidade', () => {
  it('diretório busca por cidade sem acento, UF e área', () => {
    expect(searchMembers({ cidade: 'curitiba' }).map((m) => m.id)).toEqual(['ana', 'diego']);
    expect(searchMembers({ uf: 'RS' }).map((m) => m.id)).toEqual(['bruno']);
    expect(searchMembers({ area: 'imobiliario' }).map((m) => m.id)).toEqual(['carla']);
    expect(searchMembers({})).toHaveLength(exampleMembers.length);
  });

  it('perfis de exemplo não carregam contato', () => {
    for (const member of exampleMembers) {
      expect(JSON.stringify(member)).not.toMatch(/@|\(\d{2}\)/);
    }
    expect(findMember('ninguem')).toBeUndefined();
  });
});
