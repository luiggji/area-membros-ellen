import { Module } from '@nestjs/common';

import { SUPABASE_ADMIN, SupabaseAdmin } from '../../shared/supabase/supabase.module';
import { PLAN_STORE, PlanStore } from './application/plans';
import { SupabasePlanStore, UnconfiguredPlanStore } from './infrastructure/supabase-plans';
import { PlansController } from './presentation/plans.controller';

/** Catálogo de planos e preços (CF-041). Checkout e webhook entram depois (D-019). */
@Module({
  controllers: [PlansController],
  providers: [
    {
      provide: PLAN_STORE,
      inject: [SUPABASE_ADMIN],
      useFactory: (client: SupabaseAdmin | null): PlanStore =>
        client ? new SupabasePlanStore(client) : new UnconfiguredPlanStore(),
    },
  ],
})
export class BillingModule {}
