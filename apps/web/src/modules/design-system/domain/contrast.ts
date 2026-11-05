import { resolveHex } from './tokens';

/** Luminância relativa sRGB (WCAG 2.x). */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

export interface ContrastCheck {
  foreground: string;
  background: string;
  context: string;
  ratio: number;
  /** Texto normal: ≥ 4.5:1. */
  normalText: boolean;
  /** Texto grande (≥ 24px, ou 18.66px negrito) e componentes de UI: ≥ 3:1. */
  largeTextOrUi: boolean;
}

/** Combinações realmente usadas nas telas — a lista que Ellen homologa junto com as cores. */
const pairs: ReadonlyArray<[foreground: string, background: string, context: string]> = [
  ['cf-text', 'cf-bg', 'Texto principal no canvas'],
  ['cf-text-secondary', 'cf-bg', 'Texto secundário no canvas'],
  ['cf-text-secondary', 'cf-surface-muted', 'Texto secundário em card de destaque'],
  ['cf-surface', 'cf-primary', 'Texto do botão primário'],
  ['cf-surface', 'cf-primary-hover', 'Texto do botão primário (hover)'],
  ['cf-primary', 'cf-bg', 'Links e rótulos no canvas'],
  ['cf-primary', 'cf-surface-muted', 'Rótulos em card de destaque'],
  ['cream-50', 'cf-sidebar', 'Itens da sidebar'],
  ['champagne-500', 'cf-sidebar', 'Acento na sidebar'],
  ['ink', 'blush-200', 'Faixa de aviso'],
  ['info', 'cf-surface', 'Mensagem informativa'],
  ['champagne-500', 'cf-bg', 'Acento como texto (evitar)'],
  ['rose-400', 'cf-surface', 'Rosé como texto (evitar)'],
];

export function contrastChecks(): ContrastCheck[] {
  return pairs.map(([foreground, background, context]) => {
    const ratio = contrastRatio(resolveHex(foreground), resolveHex(background));
    return {
      foreground,
      background,
      context,
      ratio,
      normalText: ratio >= 4.5,
      largeTextOrUi: ratio >= 3,
    };
  });
}
