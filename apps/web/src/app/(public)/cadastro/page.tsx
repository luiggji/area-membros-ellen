import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthCard, AuthLink } from '@/modules/identity/presentation/auth-card';
import { SignUpForm } from '@/modules/identity/presentation/auth-forms';
import { getSessionUser } from '@/shared/lib/supabase/session';

export const metadata: Metadata = { title: 'Criar conta · Caixa Forte' };

/** Cadastro (CF-030): confirmação por e-mail obrigatória antes do primeiro acesso. */
export default async function SignUpPage() {
  if (await getSessionUser()) redirect('/app');

  return (
    <AuthCard
      title="Criar conta"
      description="Seu acesso à comunidade de educação e networking para advogados."
      footer={
        <p>
          Já tem conta? <AuthLink href="/entrar">Entrar</AuthLink>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
