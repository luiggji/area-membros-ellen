import { describe, expect, it } from 'vitest';

import { revalidateRequestSchema } from '../src/cache-tags.js';

describe('revalidateRequestSchema', () => {
  it('aceita tags do catálogo', () => {
    expect(revalidateRequestSchema.parse({ tags: ['prices', 'events'] }).tags).toEqual([
      'prices',
      'events',
    ]);
  });

  it('recusa lista vazia, tag desconhecida e lista maior que o catálogo', () => {
    expect(() => revalidateRequestSchema.parse({ tags: [] })).toThrow();
    expect(() => revalidateRequestSchema.parse({ tags: ['users'] })).toThrow();
    expect(() =>
      revalidateRequestSchema.parse({ tags: ['prices', 'prices', 'prices', 'prices'] }),
    ).toThrow();
  });
});
