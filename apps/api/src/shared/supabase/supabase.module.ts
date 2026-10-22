import { Database } from '@caixa-forte/contracts';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Env } from '../config/env';

/** Cliente com a service_role: ignora RLS, existe só na API e nunca sai dela. */
export type SupabaseAdmin = SupabaseClient<Database>;

/** `null` em dev sem Supabase (CF-012); fora de dev o env exige URL e chave. */
export const SUPABASE_ADMIN = Symbol('SUPABASE_ADMIN');

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_ADMIN,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): SupabaseAdmin | null => {
        const url = config.get('SUPABASE_URL', { infer: true });
        const key = config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true });
        if (!url || !key) return null;
        return createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
      },
    },
  ],
  exports: [SUPABASE_ADMIN],
})
export class SupabaseModule {}
