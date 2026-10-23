import { buttonClasses, ErrorState } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthCard } from '@/modules/identity/presentation/auth-card';
import { NewPasswordForm } from '@/modules/identity/presentation/auth-forms';
import { getSessionUser } from '@/shared/lib/supabase/session';

export const metadata: Metadata = { title: 'Nova senha · Caixa Forte' };

/** Nova senha (CF-030): só com a sessão aberta pelo link de recuperação (/auth/callback). */
export default async function NewPasswordPage() {
  if (!(await getSessionUser())) {
    return (
      <ErrorState
        size="page"
        title="Este link expirou."
        description="Peça um novo link para redefinir a senha."
        action={
          <Link href="/recuperar-senha" className={buttonClasses()}>
            Pedir novo link
          </Link>
        }
      />
    );
  }

  return (
    <AuthCard title="Nova senha" description="Escolha uma senha nova para a sua conta.">
      <NewPasswordForm />
    </AuthCard>
  );
}
