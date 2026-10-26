import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { loadAdminGate } from '@/modules/identity/infrastructure/admin-gate';
import { AuthCard } from '@/modules/identity/presentation/auth-card';
import { MfaEnrollment, MfaVerification } from '@/modules/identity/presentation/mfa-forms';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Verificação em duas etapas · Caixa Forte' };

/** Segundo fator da equipe (CF-034): cadastrar o app autenticador ou digitar o código. */
export default async function AdminMfaPage() {
  const { access, verifiedFactorId } = await loadAdminGate();
  if (access === 'allow') redirect('/admin');

  return (
    <PublicFrame>
      {access === 'verify_mfa' && verifiedFactorId ? (
        <AuthCard
          title="Verificação em duas etapas"
          description="Digite o código que aparece no seu app autenticador."
        >
          <MfaVerification factorId={verifiedFactorId} />
        </AuthCard>
      ) : (
        <AuthCard
          title="Proteja seu acesso"
          description="O painel da equipe exige verificação em duas etapas. Leva um minuto, uma vez só."
        >
          <MfaEnrollment />
        </AuthCard>
      )}
    </PublicFrame>
  );
}
