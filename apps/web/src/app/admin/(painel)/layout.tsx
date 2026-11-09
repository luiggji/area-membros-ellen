import { DemoBanner } from '@/modules/demo/presentation/demo-banner';
import { loadDisplayName } from '@/modules/identity/infrastructure/supabase-profile';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { SignOutButton } from '@/modules/identity/presentation/auth-forms';
import { visibleAdminNav } from '@/modules/navigation/domain/admin-nav';
import { AdminShell } from '@/modules/navigation/presentation/admin-shell';
import { MemberAccount } from '@/modules/navigation/presentation/member-account';
import { demoMode } from '@/shared/config/demo';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

/**
 * Painel da equipe: só com o segundo fator verificado nesta sessão (CF-034), dentro do shell da
 * equipe com o menu filtrado pelo papel (doc G §4.9).
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { roles } = await requireAdminPanel();
  const user = await getSessionUser();
  const name = user ? await loadDisplayName(await createSupabaseServerClient(), user.id) : null;
  const demo = demoMode();

  return (
    <AdminShell
      items={visibleAdminNav(roles, demo)}
      banner={demo ? <DemoBanner /> : undefined}
      topbarEnd={
        <>
          <MemberAccount name={name} email={user?.email ?? ''} />
          <SignOutButton variant="ghost" />
        </>
      }
    >
      {children}
    </AdminShell>
  );
}
