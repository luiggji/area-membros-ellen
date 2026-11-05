import { describe, expect, it } from 'vitest';

import {
  activeSlug,
  allMemberNav,
  drawerNav,
  mobileBarNav,
  moreNav,
  NAV_LIMITS,
  navHref,
  primaryNav,
} from './member-nav';

describe('navegação do membro — regras do doc G e do kit V2', () => {
  it('primeiro nível tem no máximo 6 destinos e a barra mobile 4 + Mais', () => {
    expect(primaryNav.length).toBeLessThanOrEqual(NAV_LIMITS.primary);
    expect(mobileBarNav()).toHaveLength(NAV_LIMITS.mobileBar);
  });

  it('todo destino P0 é alcançável no mobile (barra ou drawer), sem duplicar', () => {
    const mobile = [...mobileBarNav(), ...drawerNav()].map((item) => item.slug);
    expect(new Set(mobile)).toEqual(new Set(allMemberNav.map((item) => item.slug)));
    expect(mobile).toHaveLength(allMemberNav.length);
  });

  it('itens de "Mais" seguem no menu e cada um aponta a Issue que entrega a tela', () => {
    expect(moreNav.map((item) => item.label)).toEqual([
      'Conexões',
      'Ao Vivo',
      'Cofre de Materiais',
      'Meu Planejamento',
      'Ajuda',
    ]);
    for (const item of allMemberNav) expect(item.deliveredBy).toMatch(/^CF-\d{3}$/);
  });

  it('monta os links da área real e do protótipo', () => {
    const cafe = primaryNav.find((item) => item.slug === 'cafe')!;
    expect(navHref(primaryNav[0]!, '/app')).toBe('/app');
    expect(navHref(cafe, '/app')).toBe('/eventos');
    expect(navHref(cafe, '/prototipo')).toBe('/prototipo/cafe');
  });

  it('marca o item ativo pela URL, inclusive em subpáginas', () => {
    expect(activeSlug('/app', '/app')).toBe('');
    expect(activeSlug('/app/cursos/planejamento-2027', '/app')).toBe('cursos');
    expect(activeSlug('/eventos/cafe-ourinhos', '/app')).toBe('cafe');
    expect(activeSlug('/prototipo/cofre/', '/prototipo')).toBe('cofre');
    expect(activeSlug('/app/desconhecida', '/app')).toBeUndefined();
    expect(activeSlug('/prototipo/equipe', '/prototipo')).toBeUndefined();
  });
});
