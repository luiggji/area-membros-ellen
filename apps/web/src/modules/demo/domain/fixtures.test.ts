import { describe, expect, it } from 'vitest';

import { adminNav, exampleCourses, HOME_LIMITS, parseHomeVariant } from './fixtures';

describe('demonstração — regras do doc G', () => {
  it('home não passa de 3 cursos em destaque', () => {
    expect(exampleCourses.length).toBeLessThanOrEqual(HOME_LIMITS.courses);
  });

  it('cada área da equipe aponta o item do backlog que entrega a tela real', () => {
    for (const item of adminNav) {
      expect(item.deliveredBy).toMatch(/^CF-\d{3}$/);
    }
  });

  it('variação da home cai em "jornada" para qualquer valor inesperado', () => {
    expect(parseHomeVariant('novo')).toBe('novo');
    expect(parseHomeVariant(undefined)).toBe('jornada');
    expect(parseHomeVariant(['novo'])).toBe('jornada');
  });
});
