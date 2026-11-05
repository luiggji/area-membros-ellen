import { redirect } from 'next/navigation';

import { loadDisplayName } from '@/modules/identity/infrastructure/supabase-profile';
import { SignOutButton } from '@/modules/identity/presentation/auth-forms';
import { MemberAccount } from '@/modules/navigation/presentation/member-account';
import { MemberShell } from '@/modules/navigation/presentation/member-shell';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

/**
 * Área do membro:
 * - exige sessão válida no Auth (CF-030). O proxy já redireciona guardando o destino; esta
 *   checagem é a defesa em profundidade no servidor;
 * - shell definitivo (CF-021/CF-171): sidebar com 6 destinos + "Mais", barra inferior no mobile;
 * - renderizada por requisição (ler a sessão é dinâmico), para o nonce da CSP chegar aos scripts
 *   (CF-152).
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/entrar');
  const name = await loadDisplayName(await createSupabaseServerClient(), user.id);

  return (
    <MemberShell
      topbarEnd={
        <>
          <MemberAccount name={name} email={user.email ?? ''} />
          <SignOutButton variant="ghost" />
        </>
      }
    >
      {children}
    </MemberShell>
  );
}
