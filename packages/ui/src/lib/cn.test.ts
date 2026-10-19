import { describe, expect, it } from 'vitest';

import { cn } from './cn.js';

describe('cn', () => {
  it('mantém a última classe conflitante do Tailwind', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });
});
