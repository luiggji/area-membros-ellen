import { describe, expect, it } from 'vitest';

import { allMemberNav } from './member-nav';
import { findMemberSection, memberSectionStates } from './member-sections';

// Destinos com tela real ou página própria: não usam o estado vazio genérico.
const BUILT = ['', 'jornada', 'cursos', 'cafe', 'assinatura'];

describe('seções do membro ainda sem tela (CF-171)', () => {
  it('todo destino do menu sem tela tem estado vazio, e só eles', () => {
    const pending = allMemberNav.map((item) => item.slug).filter((slug) => !BUILT.includes(slug));
    expect(Object.keys(memberSectionStates).sort()).toEqual(pending.sort());
  });

  it('o membro não vê código de Issue nem promessa de data', () => {
    for (const { title, description } of Object.values(memberSectionStates)) {
      expect(`${title} ${description}`).not.toMatch(/CF-\d|#\d|\b20\d\d\b/);
    }
  });

  it('acha a seção com rótulo e ícone do menu; slug desconhecido não existe', () => {
    expect(findMemberSection('comunidade')).toMatchObject({ label: 'Comunidade' });
    expect(findMemberSection('cursos')).toBeNull();
    expect(findMemberSection('jornada')).toBeNull();
    expect(findMemberSection('qualquer')).toBeNull();
  });
});
