import { describe, expect, it } from 'vitest';

import { activeAdminSlug, findAdminDemo, visibleAdminNav } from './admin-nav';

const slugs = (items: { slug: string }[]) => items.map((item) => item.slug);

describe('navegação do painel da equipe', () => {
  it('comercial vê só visão geral e check-in (este só na demonstração)', () => {
    expect(slugs(visibleAdminNav(['commercial'], false))).toEqual(['']);
    expect(slugs(visibleAdminNav(['commercial'], true))).toEqual(['', 'checkin']);
  });

  it('owner vê as ferramentas reais e, na demonstração, as telas novas', () => {
    expect(slugs(visibleAdminNav(['owner'], false))).toEqual([
      '',
      'conteudo',
      'materiais',
      'planos',
      'acessos',
    ]);
    expect(visibleAdminNav(['owner'], true)).toHaveLength(9);
  });

  it('tela de demonstração respeita a permissão do papel', () => {
    expect(findAdminDemo('relatorios', ['owner'])?.label).toBe('Relatórios');
    expect(findAdminDemo('relatorios', ['commercial'])).toBeUndefined();
    expect(findAdminDemo('conteudo', ['owner'])).toBeUndefined();
  });

  it('marca o item ativo, com a visão geral só na raiz', () => {
    expect(activeAdminSlug('/admin')).toBe('');
    expect(activeAdminSlug('/admin/conteudo/novo')).toBe('conteudo');
    expect(activeAdminSlug('/admin/desconhecida')).toBeUndefined();
  });
});
