import { describe, expect, it } from '@jest/globals';

import { HealthReport } from './health-report';

describe('HealthReport', () => {
  const base = { service: 'api', version: '0.0.0', checkedAt: new Date() };

  it('fica ok quando todas as dependências estão saudáveis', () => {
    const report = HealthReport.create({ ...base, checks: [{ name: 'db', healthy: true }] });
    expect(report.status).toBe('ok');
  });

  it('fica degraded quando alguma dependência falha', () => {
    const report = HealthReport.create({
      ...base,
      checks: [
        { name: 'db', healthy: true },
        { name: 'email', healthy: false },
      ],
    });
    expect(report.status).toBe('degraded');
  });
});
