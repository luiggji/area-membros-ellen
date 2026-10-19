import { Inject, Injectable } from '@nestjs/common';

import { HealthReport } from '../domain/health-report';
import { CLOCK, Clock, DEPENDENCY_CHECKERS, DependencyChecker } from './ports';

@Injectable()
export class GetHealthUseCase {
  constructor(
    @Inject(DEPENDENCY_CHECKERS) private readonly checkers: DependencyChecker[],
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(): Promise<HealthReport> {
    const checks = await Promise.all(this.checkers.map((checker) => checker.check()));
    return HealthReport.create({
      service: 'caixa-forte-api',
      version: process.env.npm_package_version ?? '0.0.0',
      checks,
      checkedAt: this.clock.now(),
    });
  }
}
