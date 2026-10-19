export type HealthStatus = 'ok' | 'degraded';

export interface DependencyCheck {
  readonly name: string;
  readonly healthy: boolean;
}

/** Entidade de domínio: regra pura, sem dependência de framework. */
export class HealthReport {
  private constructor(
    readonly service: string,
    readonly version: string,
    readonly checks: readonly DependencyCheck[],
    readonly checkedAt: Date,
  ) {}

  static create(params: {
    service: string;
    version: string;
    checks: readonly DependencyCheck[];
    checkedAt: Date;
  }): HealthReport {
    return new HealthReport(params.service, params.version, params.checks, params.checkedAt);
  }

  get status(): HealthStatus {
    return this.checks.every((check) => check.healthy) ? 'ok' : 'degraded';
  }
}
