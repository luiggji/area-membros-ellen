import { describe, expect, it } from 'vitest';

import { adminNav, exampleCourses, findSection, HOME_LIMITS, parseHomeVariant } from './fixtures';

describe('protótipo — regras do doc G', () => {
  it('home não passa de 3 cursos em destaque', () => {
    expect(exampleCourses.length).toBeLessThanOrEqual(HOME_LIMITS.courses);
  });

  it('cada área da equipe aponta o item do backlog que entrega a tela real', () => {
    for (const item of adminNav) {
      expect(item.deliveredBy).toMatch(/^CF-\d{3}$/);
    }
  });

  it('encontra seções conhecidas e rejeita desconhecidas e a home', () => {
    expect(findSection('cursos')?.label).toBe('Cursos');
    expect(findSection('conexoes')?.label).toBe('Conexões');
    expect(findSection('admin')).toBeUndefined();
    expect(findSection('')).toBeUndefined();
  });

  it('variação da home cai em "jornada" para qualquer valor inesperado', () => {
    expect(parseHomeVariant('novo')).toBe('novo');
    expect(parseHomeVariant(undefined)).toBe('jornada');
    expect(parseHomeVariant(['novo'])).toBe('jornada');
  });
});
