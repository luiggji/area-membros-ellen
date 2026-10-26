import { describe, expect, it } from 'vitest';

import { describeAccess } from './member-access';

describe('estado de acesso na tela Assinatura (CF-046)', () => {
  it('sem acesso: diz a verdade, sem prometer data', () => {
    expect(describeAccess(null)).toMatchObject({
      active: false,
      title: 'Você ainda não tem acesso de assinante',
    });
  });

  it('concessão manual mostra até quando vale, no fuso de Brasília', () => {
    const summary = describeAccess({
      source: 'manual',
      subscriptionStatus: null,
      validUntil: '2026-12-01T02:00:00Z', // 30/11 às 23h em Brasília
    });
    expect(summary).toEqual({
      active: true,
      title: 'Acesso liberado pela equipe',
      description: 'Seu acesso vale até 30/11/2026.',
    });
  });

  it('assinatura: ativa, cancelamento agendado e pagamento pendente', () => {
    const at = (status: string) =>
      describeAccess({
        source: 'subscription',
        subscriptionStatus: status,
        validUntil: '2026-11-20T15:00:00Z',
      });
    expect(at('active').description).toBe('Próxima renovação em 20/11/2026.');
    expect(at('cancel_at_period_end')).toMatchObject({
      title: 'Cancelamento agendado',
      description: 'Seu acesso continua até 20/11/2026.',
    });
    expect(at('past_due').title).toBe('Pagamento pendente');
  });

  it('sem data conhecida, não inventa uma', () => {
    const summary = describeAccess({
      source: 'manual',
      subscriptionStatus: null,
      validUntil: null,
    });
    expect(summary.description).not.toMatch(/\d/);
  });
});
