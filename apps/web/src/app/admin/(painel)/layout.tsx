import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

/** Painel da equipe: só com o segundo fator verificado nesta sessão (CF-034). */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPanel();
  return children;
}
