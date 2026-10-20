import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastChecks, contrastRatio } from './contrast';
import { colorTokens, resolveHex } from './tokens';

const themeCss = readFileSync(
  path.join(import.meta.dirname, '../../../../../../packages/ui/src/theme.css'),
  'utf8',
);

/** `--color-x: valor;` do theme.css, com `var(--color-y)` normalizado para `y`. */
function themeColors(): Map<string, string> {
  const colors = new Map<string, string>();
  for (const [, name, raw] of themeCss.matchAll(/--color-([\w-]+):\s*([^;]+);/g)) {
    const alias = /^var\(--color-([\w-]+)\)$/.exec(raw!.trim());
    colors.set(name!, alias ? alias[1]! : raw!.trim().toLowerCase());
  }
  return colors;
}

describe('tokens de cor', () => {
  it('espelham exatamente o packages/ui/src/theme.css', () => {
    const fromCss = themeColors();
    const fromCatalog = new Map(colorTokens.map((t) => [t.name, t.value]));
    expect(fromCatalog).toEqual(fromCss);
  });

  it('resolve aliases semânticos até o HEX', () => {
    expect(resolveHex('cf-text')).toBe('#30232b');
    expect(resolveHex('cf-surface')).toBe('#ffffff');
    expect(() => resolveHex('nao-existe')).toThrow();
  });
});

describe('contraste WCAG', () => {
  it('calcula os extremos conhecidos', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('texto principal, secundário e botão primário passam AA para texto normal', () => {
    const essentials = contrastChecks().filter((c) =>
      [
        'Texto principal no canvas',
        'Texto secundário no canvas',
        'Texto do botão primário',
      ].includes(c.context),
    );
    expect(essentials).toHaveLength(3);
    for (const check of essentials) expect(check.normalText).toBe(true);
  });
});
