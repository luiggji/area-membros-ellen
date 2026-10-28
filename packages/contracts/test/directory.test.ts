import { describe, expect, it } from 'vitest';

import { directoryProfileInputSchema } from '../src/directory.js';

const input = {
  displayName: 'Ana Fictícia',
  city: 'Curitiba',
  state: 'PR',
  areas: 'Família, Sucessões',
  bio: '',
  links: 'https://exemplo.test/ana',
};

describe('perfil público do diretório', () => {
  it('áreas e links digitados viram listas; vazios viram null', () => {
    expect(directoryProfileInputSchema.parse(input)).toEqual({
      displayName: 'Ana Fictícia',
      city: 'Curitiba',
      state: 'PR',
      areas: ['Família', 'Sucessões'],
      bio: null,
      links: ['https://exemplo.test/ana'],
    });
    expect(
      directoryProfileInputSchema.parse({ ...input, areas: '', links: '', city: '' }),
    ).toMatchObject({ areas: [], links: [], city: null });
  });

  it('recusa link que não é https, mais de 5 áreas e mais de 3 links', () => {
    expect(
      directoryProfileInputSchema.safeParse({ ...input, links: 'javascript:alert(1)' }).success,
    ).toBe(false);
    expect(
      directoryProfileInputSchema.safeParse({ ...input, links: 'http://exemplo.test' }).success,
    ).toBe(false);
    expect(
      directoryProfileInputSchema.safeParse({ ...input, areas: 'a1,a2,a3,a4,a5,a6' }).success,
    ).toBe(false);
    expect(
      directoryProfileInputSchema.safeParse({
        ...input,
        links: 'https://a.test/1, https://a.test/2, https://a.test/3, https://a.test/4',
      }).success,
    ).toBe(false);
  });
});
