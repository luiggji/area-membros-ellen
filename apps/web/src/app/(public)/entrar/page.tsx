import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { safeNext } from '@/modules/identity/domain/safe-redirect';
import { AuthCard, AuthLink } from '@/modules/identity/presentation/auth-card';
import { SignInForm } from '@/modules/identity/presentation/auth-forms';
import { getSessionUser } from '@/shared/lib/supabase/session';

export const metadata: Metadata = { title: 'Entrar · Caixa Forte' };

type Search = Promise<{ next?: string; erro?: string; saiu?: string }>;

/** Login (CF-030). Já logado vai direto para o destino. */
export default async function SignInPage({ searchParams }: { searchParams: Search }) {
  const { next, erro, saiu } = await searchParams;
  if (await getSessionUser()) redirect(safeNext(next));

  return (
    <AuthCard
      title="Entrar"
      description="Continue de onde parou."
      footer={
        <>
          <AuthLink href="/recuperar-senha">Esqueci minha senha</AuthLink>
          <p>
            Ainda não tem conta? <AuthLink href="/cadastro">Criar conta</AuthLink>
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {saiu ? <Notice>Você saiu da sua conta.</Notice> : null}
        {erro === 'link' ? (
          <Notice tone="danger">
            Este link expirou ou já foi usado. Entre com sua senha ou peça um novo link.
          </Notice>
        ) : null}
        <SignInForm next={next} />
      </div>
    </AuthCard>
  );
}
