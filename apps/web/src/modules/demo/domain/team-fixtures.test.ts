import { describe, expect, it } from 'vitest';

import { exampleEvents, parseCheckinResult, parseReportPeriod } from './team-fixtures';

describe('demonstração — painel da equipe', () => {
  it('nenhum evento de exemplo vende acima da capacidade', () => {
    for (const event of exampleEvents) expect(event.sold).toBeLessThanOrEqual(event.capacity);
  });

  it('resultado de check-in e período aceitam só valores conhecidos', () => {
    expect(parseCheckinResult('usado')).toBe('usado');
    expect(parseCheckinResult('qualquer')).toBeUndefined();
    expect(parseReportPeriod('12m')).toBe('12m');
    expect(parseReportPeriod(['12m'])).toBe('30d');
  });
});
