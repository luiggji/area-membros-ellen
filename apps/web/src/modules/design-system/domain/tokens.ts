/**
 * Catálogo dos tokens de cor exibidos em `/design` (CF-170). A fonte de verdade é
 * `packages/ui/src/theme.css`; `tokens.test.ts` falha se este arquivo divergir dele.
 * `value` é o HEX (paleta) ou o token de origem (semânticos), só para documentação: a tela pinta
 * cada amostra com `var(--color-*)`, nunca com o HEX daqui.
 */

export type TokenGroup = 'paleta' | 'estado' | 'semantico';

export interface ColorToken {
  name: string;
  value: string;
  group: TokenGroup;
  usage: string;
}

export const colorTokens: readonly ColorToken[] = [
  { name: 'plum-950', value: '#321927', group: 'paleta', usage: 'Sidebar, superfície profunda' },
  { name: 'wine-700', value: '#693548', group: 'paleta', usage: 'Botão primário, foco ativo' },
  { name: 'cream-50', value: '#faf7f3', group: 'paleta', usage: 'Canvas do produto' },
  { name: 'sand-100', value: '#f3eae4', group: 'paleta', usage: 'Cards de destaque' },
  { name: 'blush-200', value: '#ebd7cf', group: 'paleta', usage: 'Detalhes suaves, ícones' },
  { name: 'champagne-500', value: '#c39b83', group: 'paleta', usage: 'Acento discreto' },
  { name: 'ink', value: '#30232b', group: 'paleta', usage: 'Títulos e corpo' },
  { name: 'muted', value: '#655b60', group: 'paleta', usage: 'Texto auxiliar' },
  { name: 'success', value: '#277253', group: 'estado', usage: 'Confirmação' },
  { name: 'warning', value: '#996317', group: 'estado', usage: 'Atenção' },
  { name: 'danger', value: '#b23c50', group: 'estado', usage: 'Erro, ação destrutiva' },
  { name: 'cf-bg', value: 'cream-50', group: 'semantico', usage: 'Fundo das telas' },
  { name: 'cf-surface', value: '#ffffff', group: 'semantico', usage: 'Cards de leitura' },
  { name: 'cf-surface-muted', value: 'sand-100', group: 'semantico', usage: 'Cards de destaque' },
  { name: 'cf-sidebar', value: 'plum-950', group: 'semantico', usage: 'Navegação lateral' },
  { name: 'cf-primary', value: 'wine-700', group: 'semantico', usage: 'Ação principal' },
  { name: 'cf-accent', value: 'champagne-500', group: 'semantico', usage: 'Acento' },
  { name: 'cf-text', value: 'ink', group: 'semantico', usage: 'Texto principal' },
  { name: 'cf-text-secondary', value: 'muted', group: 'semantico', usage: 'Texto secundário' },
  { name: 'cf-border', value: '#e5d9d2', group: 'semantico', usage: 'Bordas finas' },
  { name: 'cf-focus', value: 'wine-700', group: 'semantico', usage: 'Anel de foco' },
];

/** HEX final de um token, seguindo aliases (`cf-text` → `ink` → `#30232b`). */
export function resolveHex(name: string, tokens: readonly ColorToken[] = colorTokens): string {
  const token = tokens.find((t) => t.name === name);
  if (!token) throw new Error(`Token desconhecido: ${name}`);
  return token.value.startsWith('#') ? token.value : resolveHex(token.value, tokens);
}
