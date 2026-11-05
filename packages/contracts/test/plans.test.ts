import { describe, expect, it } from 'vitest';

import {
  brlToCents,
  createPlanRequestSchema,
  formatCents,
  publishPriceRequestSchema,
} from '../src/plans.js';

describe('valores em reais (CF-041)', () => {
  it('converte para centavos sem float', () => {
    expect(brlToCents('89')).toBe(8900);
    expect(brlToCents('89,9')).toBe(8990);
    expect(brlToCents('R$ 790,00')).toBe(79000);
    expect(brlToCents('1.234,56')).toBe(123456);
    expect(brlToCents('0,07')).toBe(7);
  });

  it('recusa formatos ambíguos ou inválidos', () => {
    for (const bad of ['', 'abc', '89.90', '89,999', '-10', '1,234.56', '12.34,5x']) {
      expect(brlToCents(bad), bad).toBeNull();
    }
  });

  it('formata centavos em reais', () => {
    expect(formatCents(8900).replace(/\s/g, ' ')).toBe('R$ 89,00');
  });
});

describe('pedidos de plano e preço (CF-041)', () => {
  it('código do plano em kebab-case, normalizado', () => {
    expect(
      createPlanRequestSchema.parse({ code: ' Plano-Anual ', name: 'Anual', description: '' }),
    ).toMatchObject({ code: 'plano-anual' });
    expect(
      createPlanRequestSchema.safeParse({ code: 'plano anual', name: 'Anual', description: '' })
        .success,
    ).toBe(false);
  });

  it('preço: inteiro em centavos, mínimo R$ 1,00, só mensal ou anual', () => {
    expect(
      publishPriceRequestSchema.safeParse({ interval: 'month', amountCents: 9900 }).success,
    ).toBe(true);
    expect(
      publishPriceRequestSchema.safeParse({ interval: 'month', amountCents: 50 }).success,
    ).toBe(false);
    expect(
      publishPriceRequestSchema.safeParse({ interval: 'month', amountCents: 89.9 }).success,
    ).toBe(false);
    expect(
      publishPriceRequestSchema.safeParse({ interval: 'week', amountCents: 9900 }).success,
    ).toBe(false);
  });
});
