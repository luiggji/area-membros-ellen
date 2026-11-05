import { describe, expect, it } from 'vitest';

import { errorReference } from './error-reference';

describe('errorReference', () => {
  it('devolve só o digest do Next, nunca a mensagem', () => {
    const error = Object.assign(new Error('senha do banco incorreta'), { digest: '2817366461' });
    expect(errorReference(error)).toBe('2817366461');
  });

  it('sem digest (erro de cliente ou valor qualquer), não inventa referência', () => {
    expect(errorReference(new Error('x'))).toBeUndefined();
    expect(errorReference('texto lançado')).toBeUndefined();
    expect(errorReference(Object.assign(new Error('x'), { digest: 42 }))).toBeUndefined();
  });
});
