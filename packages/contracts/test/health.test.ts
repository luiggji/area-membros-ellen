import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from '../src/health.js';

const valid = {
  status: 'ok',
  service: 'api',
  version: '0.0.0',
  timestamp: new Date().toISOString(),
  checks: [{ name: 'audit_log', healthy: true }],
};

describe('healthResponseSchema', () => {
  it('aceita uma resposta válida', () => {
    expect(healthResponseSchema.parse(valid).status).toBe('ok');
  });

  it('aceita lista de dependências vazia (dev/CI sem Supabase)', () => {
    expect(healthResponseSchema.parse({ ...valid, checks: [] }).checks).toEqual([]);
  });

  it('rejeita status desconhecido', () => {
    expect(() => healthResponseSchema.parse({ ...valid, status: 'up' })).toThrow();
  });

  it('rejeita dependência sem estado booleano', () => {
    expect(() =>
      healthResponseSchema.parse({ ...valid, checks: [{ name: 'audit_log', healthy: 'sim' }] }),
    ).toThrow();
  });
});
