import { describe, expect, it } from 'vitest';

import { parsePublicEnv } from './env';

describe('parsePublicEnv', () => {
  it('aplica defaults locais quando nada é informado', () => {
    expect(parsePublicEnv({}).NEXT_PUBLIC_API_URL).toBe('http://localhost:4000/api/v1');
  });

  it('rejeita URL inválida', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_URL: 'nao-e-url' })).toThrow();
  });
});
