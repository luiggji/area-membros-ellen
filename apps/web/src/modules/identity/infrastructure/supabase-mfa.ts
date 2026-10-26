import type { SupabaseClient } from '@supabase/supabase-js';

import type { MfaGateway } from '../application/mfa-use-cases';

/** Estado de MFA da sessão atual (CF-034): nível e o fator TOTP verificado, se houver. */
export async function loadMfaStatus(client: SupabaseClient) {
  const [level, factors] = await Promise.all([
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
    client.auth.mfa.listFactors(),
  ]);
  const current = level.data?.currentLevel;
  return {
    aal: current === 'aal2' ? ('aal2' as const) : current === 'aal1' ? ('aal1' as const) : null,
    verifiedFactorId: factors.data?.totp[0]?.id ?? null,
  };
}

export function supabaseMfaGateway(client: SupabaseClient): MfaGateway {
  return {
    async removePendingTotp() {
      const { data } = await client.auth.mfa.listFactors();
      const pending = (data?.all ?? []).filter(
        (factor) => factor.factor_type === 'totp' && factor.status === 'unverified',
      );
      await Promise.all(pending.map((factor) => client.auth.mfa.unenroll({ factorId: factor.id })));
    },
    async enrollTotp() {
      const { data, error } = await client.auth.mfa.enroll({
        factorType: 'totp',
        // Nome visível no app autenticador; único por usuário.
        friendlyName: `Caixa Forte ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error || !data) return null;
      return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
    },
    async verify(factorId, code) {
      const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
      return !error;
    },
  };
}
