import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from '../src/health.js';

describe('healthResponseSchema', () => {
  it('aceita uma resposta válida', () => {
    const parsed = healthResponseSchema.parse({
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      timestamp: new Date().toISOString(),
    });
    expect(parsed.status).toBe('ok');
  });

  it('rejeita status desconhecido', () => {
    expect(() =>
      healthResponseSchema.parse({
        status: 'up',
        service: 'api',
        version: '0.0.0',
        timestamp: new Date().toISOString(),
      }),
    ).toThrow();
  });
});
