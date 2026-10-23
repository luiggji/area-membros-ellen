import type { Metadata } from 'next';

import { AuthCard, AuthLink } from '@/modules/identity/presentation/auth-card';
import { PasswordResetRequestForm } from '@/modules/identity/presentation/auth-forms';

export const metadata: Metadata = { title: 'Recuperar senha · Caixa Forte' };

/** Pede o link de redefinição (CF-030). A resposta não revela se a conta existe. */
export default function PasswordResetRequestPage() {
  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe o e-mail da sua conta para receber um link de redefinição."
      footer={<AuthLink href="/entrar">Voltar para entrar</AuthLink>}
    >
      <PasswordResetRequestForm />
    </AuthCard>
  );
}
