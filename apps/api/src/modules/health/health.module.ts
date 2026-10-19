import { Module } from '@nestjs/common';

import { GetHealthUseCase } from './application/get-health.use-case';
import { CLOCK, DEPENDENCY_CHECKERS } from './application/ports';
import { SystemClock } from './infrastructure/system-clock';
import { HealthController } from './presentation/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    GetHealthUseCase,
    { provide: CLOCK, useClass: SystemClock },
    // Checkers de DB/e-mail/gateway entram aqui quando os adapters existirem (CF-017).
    { provide: DEPENDENCY_CHECKERS, useValue: [] },
  ],
})
export class HealthModule {}
