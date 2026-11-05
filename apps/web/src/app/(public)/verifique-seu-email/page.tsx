import type { Metadata } from 'next';

import { AuthCard, AuthLink } from '@/modules/identity/presentation/auth-card';

export const metadata: Metadata = { title: 'Confirme seu e-mail · Caixa Forte' };

/**
 * Depois do cadastro (CF-030). Mesma mensagem exista ou não a conta: não revela e-mails
 * cadastrados.
 */
export default function CheckEmailPage() {
  return (
    <AuthCard
      title="Confirme seu e-mail"
      description="Enviamos um link de confirmação. Abra a mensagem e toque no link para ativar sua conta."
      footer={
        <p>
          Já confirmou? <AuthLink href="/entrar">Entrar</AuthLink>
        </p>
      }
    >
      <p className="text-sm text-cf-text-secondary">
        Não encontrou? Confira o spam e a aba de promoções. O link vale por 1 hora.
      </p>
    </AuthCard>
  );
}
